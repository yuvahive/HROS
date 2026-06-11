// HR Data Schemas - Defines structure for all 16 HROS tables
// Use these when creating forms, validating data, and populating records

// ==================== PEOPLE TABLE ====================
export const peopleSchema = {
  id: 'employee-001', // Unique ID
  name: 'John Doe',
  email: 'john@yuvahive.com',
  role: 'Backend Engineer', // Job title
  team: 'Engineering',
  status: 'active', // active, on-leave, on-notice, exited
  seniority: 'senior', // junior, mid, senior, lead
  manager: 'emp-002', // Manager ID (linked to people)
  startDate: '2023-01-15',
  salary: 100000,
  equity: 0.5, // Percentage
  vestingStart: '2023-01-15',
  vestingSchedule: 4, // Years
  skills: ['Node.js', 'PostgreSQL', 'AWS'], // Array of skill names
  currentProjects: ['proj-001', 'proj-002'], // Project IDs
  lastCheckInDate: '2024-03-20',
  nextCheckInDue: '2024-04-20',
  notes: 'Great performance this quarter',
  redFlags: [] // Array of red flag IDs
}

// ==================== HIRING PIPELINE ====================
export const hiringPipelineSchema = {
  id: 'hire-001',
  name: 'Sarah Khan',
  appliedDate: '2024-03-10',
  source: 'LinkedIn', // Direct, LinkedIn, Referral, Job Board, etc.
  role: 'Frontend Engineer',
  stage: 'interview', // applicant, screening, interview, offered, hired, rejected
  screeningScore: 8, // 1-10
  screeningDate: '2024-03-11',
  screeningNotes: 'Strong technical background',
  interviewDate: '2024-03-15',
  interviewTime: '3:00 PM',
  interviewerName: 'Raj Verma',
  interviewNotes: 'Great communication skills, 9/10',
  technicalScore: 9,
  cultureFitScore: 8,
  offerSalary: 100000,
  offerEquity: 0.5,
  offerSentDate: '2024-03-16',
  offerExpiryDate: '2024-03-23',
  offerStatus: 'pending', // sent, accepted, rejected, expired
  resumerLink: 'https://docs.google.com/...',
  email: 'sarah@example.com',
  phone: '+1234567890',
  notes: 'Top candidate'
}

// ==================== ONBOARDING ====================
export const onboardingSchema = {
  id: 'onboard-001',
  personId: 'emp-003',
  personName: 'Raj Verma',
  startDate: '2024-03-01',
  currentDay: 15,
  stage: 'week-2-3', // day-1, week-1, week-2-3, week-4, complete
  buddy: 'emp-002', // Assigned buddy ID
  tasks: [
    { name: 'Setup email', completed: true, completedDate: '2024-03-01' },
    { name: 'GitHub access', completed: true, completedDate: '2024-03-01' },
    { name: 'Laptop setup', completed: true, completedDate: '2024-03-01' },
    { name: 'Codebase walkthrough', completed: true, completedDate: '2024-03-02' },
    { name: 'First PR deployed', completed: false, dueDate: '2024-03-15' },
    { name: 'Code review process', completed: false, dueDate: '2024-03-20' }
  ],
  managerNotes: 'Great progress this week',
  blockers: [],
  setupCallDate: '2024-03-01',
  feedbackFromBuddy: 'Picking things up quickly'
}

// ==================== EXITS & ALUMNI ====================
export const exitsSchema = {
  id: 'exit-001',
  personId: 'emp-004',
  personName: 'John Smith',
  noticeDate: '2024-03-10',
  lastDay: '2024-03-25',
  reason: 'Better opportunity', // Better opportunity, Relocation, Career change, etc.
  nextCompany: 'TechCorp Inc',
  nextRole: 'Sr. Engineer',
  stage: 'on-notice', // on-notice, exiting, alumni, boomerang-ready
  ktStatus: 70, // Percentage complete (Knowledge Transfer)
  ktItems: ['Database migration docs', 'API documentation', 'deployment process'],
  ktCompletedBy: 'emp-002',
  exitInterviewDate: '2024-03-24',
  exitInterviewNotes: '',
  newsletters: true, // Alumni newsletter subscription
  boomerangScore: 9, // 1-10, would they come back?
  lastContactDate: '2024-03-25',
  severancePackage: '2 weeks',
  referencesOk: true,
  personalEmail: 'john@personal.com'
}

// ==================== WORK LOGS ====================
export const workLogsSchema = {
  id: 'log-001',
  date: '2024-03-20',
  personId: 'emp-001',
  personName: 'Raj Verma',
  projectId: 'proj-001',
  taskId: 'task-001',
  taskName: 'API user-endpoint',
  hoursWorked: 6,
  hoursEstimated: 8,
  status: 'in-progress', // in-progress, done, blocked
  output: 'https://github.com/yuvahive/api/pull/234',
  blockers: [],
  mood: '😊', // 😊 😐 😤
  learnings: 'Learned about database indexing',
  nextDayPlan: 'Deploy and test in staging'
}

// ==================== PROJECTS ====================
export const projectsSchema = {
  id: 'proj-001',
  name: 'Auth 2FA',
  owner: 'emp-001', // Person ID
  ownerName: 'Raj Verma',
  dueDate: '2024-04-15',
  completionPercent: 80,
  status: 'on-track', // on-track, at-risk, blocked, complete
  priority: 'high', // high, medium, low
  impact: 'high',
  startDate: '2024-03-01',
  blockers: ['Database performance issues'],
  blockerCount: 1,
  risk: 'low', // low, medium, high
  contributors: ['emp-001', 'emp-002', 'emp-003'],
  tasks: ['task-001', 'task-002', 'task-003'],
  effortEstimate: 80, // Hours
  effortActual: 72,
  description: 'Implement two-factor authentication for all users',
  acceptanceCriteria: ['SMS 2FA working', 'Email 2FA working', 'Recovery codes'],
  deliverables: []
}

// ==================== TASKS ====================
export const tasksSchema = {
  id: 'task-001',
  taskId: 'YH-101', // Human readable ID
  title: 'Implement user endpoint',
  projectId: 'proj-001',
  ownerId: 'emp-001',
  ownerName: 'Raj Verma',
  status: 'doing', // backlog, todo, doing, review, done, blocked
  priority: 'high',
  taskType: 'feature', // feature, bug, refactor, chore
  effortEstimate: 8, // Hours
  effortActual: 6,
  deadline: '2024-03-25',
  blockers: [],
  dependencies: ['task-001'],
  acceptanceCriteria: ['GET /users returns all users', 'POST /users creates user'],
  description: 'Create REST API endpoint for user management',
  githubPrLink: 'https://github.com/yuvahive/api/pull/234',
  createdDate: '2024-03-01',
  completedDate: null,
  tags: ['backend', 'api']
}

// ==================== TASK COMMENTS ====================
export const taskCommentsSchema = {
  id: 'comment-001',
  taskId: 'task-001',
  authorId: 'emp-002',
  authorName: 'Priya Shah',
  text: 'Great implementation! One small suggestion: consider adding pagination.',
  createdDate: '2024-03-20T10:30:00Z',
  mentions: ['emp-001'], // Mentioned user IDs
  attachments: []
}

// ==================== MONTHLY CHECK-INS ====================
export const checkInsSchema = {
  id: 'checkin-001',
  personId: 'emp-001',
  personName: 'Raj Verma',
  month: '2024-03',
  date: '2024-03-20',
  shipping: {
    whatShipped: 'API endpoints, database optimization',
    shipCount: 3,
    codeQuality: 'A', // A, B, C
    collaboration: 'Excellent'
  },
  growth: {
    whatLearned: 'Docker, Kubernetes basics',
    nextSkills: 'Advanced Kubernetes',
    readyToLead: false,
    stretchAssignment: 'Lead the migration project'
  },
  wellbeing: {
    workLifeBalance: 'Good',
    stressLevel: 3, // 1-10
    hoursPerWeek: 40,
    daysOffTaken: 2,
    mood: '😊',
    energy: 'High',
    additionalNotes: 'Feeling good, no concerns'
  },
  blockers: {
    description: 'None',
    impact: 'low',
    supportNeeded: false
  },
  sentiment: 'green', // green, yellow, red
  rating: 10, // 1-10
  notes: 'Excellent month, strong contributions',
  actionItems: ['task-101', 'task-102'],
  followUpDate: '2024-04-20'
}

// ==================== 1:1 MEETINGS ====================
export const oneOnOnesSchema = {
  id: 'meeting-001',
  personId: 'emp-001',
  personName: 'Raj Verma',
  managerId: 'emp-999',
  scheduledDate: '2024-03-23',
  scheduledTime: '3:00 PM',
  actualDate: '2024-03-23',
  duration: 45, // Minutes
  topic: 'Quarterly goals and performance',
  prepNotes: 'Discuss roadmap, career growth',
  summary: 'Great conversation. Raj ready for leadership role.',
  rating: 'excellent', // excellent, good, needs-improvement
  sentiment: 'green',
  shippingSummary: 'Shipped 3 major features',
  growthSummary: 'Learning new tech stack',
  wellbeingSummary: 'Good balance, no concerns',
  blockersDiscussed: 'None',
  followUpActions: 'Schedule leadership training',
  nextMeetingDate: '2024-04-20',
  attendees: ['emp-001', 'emp-999']
}

// ==================== COMPANY DECISIONS ====================
export const decisionsSchema = {
  id: 'dec-001',
  title: 'Switch to PostgreSQL',
  owner: 'emp-001',
  ownerName: 'Raj Verma',
  proposedDate: '2024-03-15',
  decidedDate: '2024-03-20',
  status: 'executing', // proposed, decided, executing, reviewed
  impact: 'high', // high, medium, low
  timeline: '2 weeks',
  pros: ['Better performance', 'Scaling capability', 'Cost effective'],
  cons: ['Migration effort', 'Learning curve'],
  votes: { total: 8, yes: 8, no: 0, abstain: 0, votePercent: 100 },
  stakeholders: ['emp-001', 'emp-002', 'emp-003'],
  rationale: 'Current DB at capacity, need better performance',
  actionItems: ['action-001', 'action-002'],
  executionProgress: 60, // Percent
  blockers: [],
  lessonsLearned: null,
  reviewedDate: null,
  documentation: 'https://notion.so/...'
}

// ==================== ACTION ITEMS ====================
export const actionItemsSchema = {
  id: 'action-001',
  title: 'Database migration setup',
  owner: 'emp-001',
  ownerName: 'Amar Patel',
  decisionId: 'dec-001',
  status: 'in-progress', // assigned, in-progress, review, complete
  priority: 'high', // high, medium, low
  dueDate: '2024-03-25',
  decidedDate: '2024-03-20',
  startedDate: '2024-03-21',
  completedDate: null,
  completionPercent: 60,
  evidence: null, // Link/screenshot when complete
  source: 'standup', // standup, 1:1, all-hands, decision
  context: 'dec-001',
  notes: 'On track, should be done by Friday'
}

// ==================== SKILLS MATRIX ====================
export const skillsSchema = {
  id: 'skill-001',
  skillName: 'Node.js',
  category: 'backend', // backend, frontend, devops, product, etc.
  difficulty: 'intermediate', // entry, intermediate, advanced
  people: [
    { personId: 'emp-001', level: 'mastery', yearsExp: 5, canMentor: true },
    { personId: 'emp-002', level: 'proficient', yearsExp: 3, canMentor: false },
    { personId: 'emp-003', level: 'learning', yearsExp: 0.1, buddy: 'emp-001' }
  ],
  masterList: ['emp-001'], // Who can mentor others
  proficientList: ['emp-002'],
  learningList: [{ personId: 'emp-003', startDate: '2024-03-01', dueDate: '2024-05-01' }]
}

// ==================== TIME OFF ====================
export const timeOffSchema = {
  id: 'timeoff-001',
  personId: 'emp-001',
  personName: 'Raj Verma',
  startDate: '2024-04-01',
  endDate: '2024-04-05',
  days: 5,
  type: 'vacation', // vacation, sick, focus-week, holiday
  status: 'approved', // planned, approved, on-leave, returned

  buddy: 'emp-002', // Who covers responsibilities
  handoffDoc: 'https://notion.so/handoff',
  daysUsed: 0,
  daysAllowed: 20,
  wellnessCheckComplete: false,
  wellnessCheckDate: null,
  wellnessNotes: ''
}

// ==================== COMPENSATION HISTORY ====================
export const compensationSchema = {
  id: 'comp-001',
  personId: 'emp-001',
  personName: 'Raj Verma',
  effectiveDate: '2024-03-01',
  salary: 110000,
  previousSalary: 100000,
  salaryChange: 10000,
  salaryChangePercent: 10,
  equity: 0.6,
  previousEquity: 0.5,
  equityChange: 0.1,
  equityChangePercent: 20,
  vestingSchedule: 4,
  changeReason: 'promotion', // hire, promotion, market-adjust, merit, etc.
  approvedBy: 'emp-999',
  approvalStatus: 'approved',
  approvalDate: '2024-03-01',
  promotionTitle: 'Senior Backend Engineer',
  promotionFrom: 'Backend Engineer'
}

// ==================== TEAM DYNAMICS ====================
export const teamDynamicsSchema = {
  id: 'dynamic-001',
  date: '2024-03-20',
  people: ['emp-001', 'emp-002', 'emp-003'],
  projectId: 'proj-001',
  collaborationType: 'pair-programming', // pair-programming, code-review, mentoring, conflict, etc.
  whatWorked: 'Great communication, quick problem solving',
  whatWasChallenging: 'Time zone differences slowed decisions',
  communicationMethod: 'Slack, video call',
  dependencies: ['task-001', 'task-002'],
  mood: 'positive', // positive, neutral, negative
  notes: 'Strong team cohesion'
}

// ==================== RED FLAGS ====================
export const redFlagsSchema = {
  id: 'flag-001',
  personId: 'emp-001',
  personName: 'Raj Verma',
  category: 'burnout', // burnout, blocker, disengagement, performance, new-hire, offers, exits
  severity: 'medium', // low, medium, high
  triggeredDate: '2024-03-20',
  description: 'Working >45 hours 3 weeks in a row',
  data: {
    hoursWorked: 48,
    daysOff: 0,
    lastCheckIn: '2024-03-10',
    moodTrend: ['😊', '😐', '😤']
  },
  suggestedAction: 'Book 1:1 check-in, offer support or time off',
  acknowledgedDate: null,
  acknowledgedBy: null,
  resolved: false,
  resolvedDate: null,
  followUpScheduled: '2024-03-25'
}

// ==================== INTERNSHIPS ====================
export const internshipSchema = {
  id: 'intern-001',
  personName: 'Alex Sharma',
  email: 'alex@college.edu',
  phone: '+919876543210',
  college: 'IIT Delhi',
  major: 'Computer Science',
  department: 'Engineering',
  position: 'Software Engineering Intern',
  
  // Duration
  startDate: '2024-06-01',
  endDate: '2024-08-31',
  durationWeeks: 12,
  
  // Assignment
  mentor: 'emp-001', // Mentor ID
  mentorName: 'Raj Verma',
  reportingManager: 'emp-999',
  
  // Learning & Goals
  learningObjectives: ['Learn React', 'Build full-stack features', 'Git workflow'],
  assignedProjects: ['proj-001', 'proj-002'],
  skillsToAcquire: ['React', 'Node.js', 'SQL'],
  
  // Progress & Status
  stage: 'active', // onboarding, active, final-review, completed, rejected
  completionPercent: 0,
  
  // Evaluations
  midtermEvalDate: '2024-07-15',
  midtermScore: null, // 1-10
  midtermFeedback: '',
  midtermEvalCompletedDate: null,
  
  finalEvalDate: '2024-08-31',
  finalScore: null, // 1-10
  finalFeedback: '',
  finalEvalCompletedDate: null,
  
  // Competency Assessment
  technicalCompetency: null, // 1-10
  communicationSkills: null, // 1-10
  teamworkRating: null, // 1-10
  problemSolving: null, // 1-10
  
  // Performance Metrics
  projectsCompleted: 0,
  tasksCompleted: 0,
  codeQuality: '', // excellent, good, average, needs-improvement
  attendancePercentage: 100,
  
  // Certificate & Completion
  certificateGenerated: false,
  certificateId: null,
  certificateGeneratedDate: null,
  certificateFilePath: '',
  completionNotes: '',
  
  // Future Opportunity
  returnOfferExtended: false,
  returnOfferAccepted: null,
  ftePossible: false,
  fteRecommendation: '', // strong-yes, yes, maybe, no
  fteRole: '',
  
  // Alumni & Follow-up
  isAlumni: false,
  referralBonus: false,
  linkedinConnection: false,
  alumniNewsletter: true,
  lastContactDate: null,
  
  // Administrative
  stipendAmount: 0,
  workHoursPerWeek: 40,
  onboardingCompleted: false,
  onboardingCompletedDate: null,
  createdDate: new Date().toISOString().split('T')[0],
  notes: '',
  redFlags: []
}

// ==================== WORK UPLOADS ====================
export const workUploadsSchema = {
  id: 'upload-001',
  uploaderId: 'emp-001',
  uploaderName: 'Raj Verma',
  uploaderRole: 'employee',
  teamId: 'team-001',
  title: 'Q1 Marketing Report',
  description: 'Final marketing analysis for Q1 2026',
  category: 'document',
  projectId: '',
  taskId: '',
  fileName: 'Q1-report.pdf',
  fileSize: 245000,
  fileType: 'application/pdf',
  fileData: '',
  driveFileId: '',
  driveFileUrl: '',
  externalLink: '',
  status: 'uploaded',
  reviewerId: null,
  reviewerName: null,
  reviewDate: null,
  reviewComments: '',
  reviewRating: null,
  uploadDate: new Date().toISOString(),
  lastModifiedDate: new Date().toISOString(),
  version: 1,
  tags: [],
  isArchived: false
}

// ==================== HELPER FUNCTIONS ====================

// Generate unique IDs
export const generateID = (prefix) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Sample data for demo
export const samplePeople = [
  {
    ...peopleSchema,
    id: 'emp-001',
    name: 'Raj Verma',
    role: 'Senior Backend Engineer',
    email: 'raj@yuvahive.com'
  },
  {
    ...peopleSchema,
    id: 'emp-002',
    name: 'Priya Shah',
    role: 'Frontend Engineer',
    email: 'priya@yuvahive.com',
    manager: 'emp-999'
  }
]
