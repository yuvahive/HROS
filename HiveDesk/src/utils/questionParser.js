import JSZip from 'jszip';

const DEFAULT_SCHEMA = [
  { field: 'question.md', type: 'file', required: true, constraints: 'min_length:100' },
  { field: 'Solution.py', type: 'file', required: true, constraints: 'min_length:50' },
  { field: 'tests.json', type: 'file', required: true, constraints: 'min_cases:3' },
  { field: 'hints', type: 'folder', required: true, constraints: 'count:3' },
  { field: 'folder.name', type: 'pattern', required: true, constraints: 'regex:Q[1-5]' },
  { field: 'folder.count', type: 'number', required: true, constraints: 'min:3,max:5' },
];

function parseConstraints(constraintsStr) {
  if (!constraintsStr) return {};
  const result = {};
  constraintsStr.split(',').forEach(part => {
    const [key, value] = part.split(':');
    if (key && value !== undefined) {
      result[key.trim()] = isNaN(value) ? value.trim() : Number(value);
    }
  });
  return result;
}

function validateFileContent(content, fieldName, constraints) {
  const errors = [];
  if (!content || content.trim().length === 0) {
    errors.push(`${fieldName} is empty`);
    return errors;
  }
  const c = parseConstraints(constraints);
  if (c.min_length && content.trim().length < c.min_length) {
    errors.push(`${fieldName} too short (min ${c.min_length} chars, got ${content.trim().length})`);
  }
  return errors;
}

function validateTestsJson(content, constraints) {
  const errors = [];
  try {
    const tests = JSON.parse(content);
    if (!Array.isArray(tests)) {
      errors.push('tests.json must be an array');
      return errors;
    }
    const c = parseConstraints(constraints);
    if (c.min_cases && tests.length < c.min_cases) {
      errors.push(`tests.json needs at least ${c.min_cases} test cases (got ${tests.length})`);
    }
    tests.forEach((test, i) => {
      if (!test.input && test.input !== '' && !test.expected) {
        errors.push(`Test case ${i + 1} missing input/expected`);
      }
    });
  } catch (e) {
    errors.push(`tests.json is invalid JSON: ${e.message}`);
  }
  return errors;
}

function validateHints(hintFiles, constraints) {
  const errors = [];
  const c = parseConstraints(constraints);
  if (c.count && hintFiles.length < c.count) {
    errors.push(`Need ${c.count} hint files (found ${hintFiles.length})`);
  }
  hintFiles.forEach(file => {
    if (file._content && file._content.trim().length < 20) {
      errors.push(`${file.name} is too short (min 20 chars)`);
    }
  });
  return errors;
}

function parseQuestionMd(content) {
  const result = { story: '', prompt: '', constraints: '', hints: [] };
  if (!content) return result;
  const sections = content.split(/^##\s+/m).filter(Boolean);
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const title = lines[0].trim().toLowerCase();
    const body = lines.slice(1).join('\n').trim();
    if (title.includes('story') || title.includes('background')) result.story = body;
    else if (title.includes('prompt') || title.includes('task') || title.includes('question')) result.prompt = body;
    else if (title.includes('constraint') || title.includes('requirement')) result.constraints = body;
  });
  if (!result.story && !result.prompt) {
    result.prompt = content;
  }
  return result;
}

function parseTestsJson(content) {
  try {
    return JSON.parse(content);
  } catch {
    return [];
  }
}

export async function parseZipFile(file, liveSchema = null) {
  const schema = liveSchema || DEFAULT_SCHEMA;
  const zip = await JSZip.loadAsync(file);
  const errors = [];
  const warnings = [];
  const questions = [];

  const folderCount = schema.find(s => s.field === 'folder.count');
  const fc = parseConstraints(folderCount?.constraints || 'min:3,max:5');
  const minFolders = fc.min || 3;
  const maxFolders = fc.max || 5;

  const folders = [];
  zip.forEach((path, zipEntry) => {
    if (zipEntry.dir) {
      const parts = path.split('/').filter(Boolean);
      if (parts.length === 1 && /^Q\d+$/i.test(parts[0])) {
        folders.push({ name: parts[0], path: path });
      }
    }
  });

  folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (folders.length < minFolders) {
    errors.push(`Need at least ${minFolders} question folders (found ${folders.length})`);
  }
  if (folders.length > maxFolders) {
    warnings.push(`Found ${folders.length} folders, max is ${maxFolders}. Extra folders will be ignored.`);
  }

  const questionFile = schema.find(s => s.field === 'question.md');
  const solutionFile = schema.find(s => s.field === 'Solution.py');
  const testsFile = schema.find(s => s.field === 'tests.json');
  const hintsField = schema.find(s => s.field === 'hints');

  for (const folder of folders.slice(0, maxFolders)) {
    const qErrors = [];
    const qWarnings = [];
    const files = {};
    const folderPath = folder.path;

    zip.forEach((path, zipEntry) => {
      if (!zipEntry.dir && path.startsWith(folderPath)) {
        const relativePath = path.substring(folderPath.length).replace(/^\//, '');
        const fileName = relativePath.split('/').pop();
        files[fileName] = { path: relativePath, name: fileName, _entry: zipEntry };
      }
    });

    const qMdFile = files['question.md'];
    if (qMdFile) {
      const content = await qMdFile._entry.async('string');
      qMdFile._content = content;
      const contentErrors = validateFileContent(content, 'question.md', questionFile?.constraints);
      qErrors.push(...contentErrors);
    } else {
      qErrors.push('question.md not found');
    }

    const solFile = files['Solution.py'] || files['solution.py'];
    if (solFile) {
      const content = await solFile._entry.async('string');
      solFile._content = content;
      const contentErrors = validateFileContent(content, 'Solution.py', solutionFile?.constraints);
      qErrors.push(...contentErrors);
    } else {
      qErrors.push('Solution.py not found');
    }

    const testsFileEntry = files['tests.json'];
    if (testsFileEntry) {
      const content = await testsFileEntry._entry.async('string');
      testsFileEntry._content = content;
      const contentErrors = validateTestsJson(content, testsFile?.constraints);
      qErrors.push(...contentErrors);
    } else {
      qErrors.push('tests.json not found');
    }

    const hintFiles = [];
    Object.values(files).forEach(f => {
      if (f.name && (f.name.startsWith('hint_') || f.name.startsWith('hint '))) {
        hintFiles.push(f);
      }
    });
    const hintErrors = validateHints(hintFiles, hintsField?.constraints);
    qErrors.push(...hintErrors);

    let questionMd = '';
    let solutionPy = '';
    let testsJson = [];
    if (qMdFile?._content) questionMd = qMdFile._content;
    if (solFile?._content) solutionPy = solFile._content;
    if (testsFileEntry?._content) testsJson = parseTestsJson(testsFileEntry._content);

    const parsed = parseQuestionMd(questionMd);

    questions.push({
      folderName: folder.name,
      folderPath: folderPath,
      title: parsed.prompt?.split('\n')[0]?.substring(0, 80) || folder.name,
      questionMd: questionMd,
      solutionPy: solutionPy,
      testsJson: testsJson,
      testCount: testsJson.length,
      hintCount: hintFiles.length,
      errors: qErrors,
      warnings: qWarnings,
      valid: qErrors.length === 0,
    });

    errors.push(...qErrors.map(e => `${folder.name}: ${e}`));
    warnings.push(...qWarnings.map(w => `${folder.name}: ${w}`));
  }

  return {
    fileName: file.name,
    totalFolders: folders.length,
    validFolders: questions.filter(q => q.valid).length,
    questions,
    errors,
    warnings,
    valid: errors.length === 0,
  };
}

export async function getLiveSchema() {
  try {
    const GAS_URL = import.meta.env.VITE_GAS_URL;
    const GAS_API_KEY = import.meta.env.VITE_GAS_API_KEY;
    const response = await fetch(`${GAS_URL}?key=${GAS_API_KEY}&action=getSchema`);
    const result = await response.json();
    if (result.data && result.data.length > 0) {
      return result.data;
    }
    return null;
  } catch {
    return null;
  }
}
