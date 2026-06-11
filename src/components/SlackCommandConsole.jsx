import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, Send, HelpCircle } from 'lucide-react'
import { getAllFromDB, addToDB, updateInDB, STORES } from '../utils/indexedDB'
import { generateID } from '../utils/sampleData'

export default function SlackCommandConsole() {
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)
  const outputRef = useRef(null)

  // Available commands
  const commands = [
    {
      pattern: '/hr status',
      description: 'Get team health status',
      handler: handleHRStatus
    },
    {
      pattern: '/hr check-in [name] [score:1-10]',
      description: 'Log a quick wellbeing check-in',
      handler: handleCheckIn
    },
    {
      pattern: '/hr blocker [name] [issue]',
      description: 'Report a blocker for team member',
      handler: handleBlocker
    },
    {
      pattern: '/hr offer [name]',
      description: 'Close a hiring offer',
      handler: handleOffer
    },
    {
      pattern: '/hr timeoff [name] [days]',
      description: 'Record time off',
      handler: handleTimeOff
    },
    {
      pattern: '/hr meeting [name]',
      description: 'Schedule 1:1 meeting',
      handler: handleMeeting
    },
    {
      pattern: '/hr task [name] [title] [hours]',
      description: 'Assign a task',
      handler: handleTask
    },
    {
      pattern: '/help',
      description: 'Show available commands',
      handler: handleHelp
    },
    {
      pattern: '/clear',
      description: 'Clear console',
      handler: handleClear
    }
  ]

  // Scroll to bottom when history changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [history])

  // Handle input change for suggestions
  const handleInputChange = (e) => {
    const value = e.target.value
    setCommand(value)

    if (value.startsWith('/')) {
      const matches = commands.filter((cmd) =>
        cmd.pattern.toLowerCase().includes(value.toLowerCase().split(' ')[0])
      )
      setSuggestions(matches)
      setSelectedIndex(-1)
    } else {
      setSuggestions([])
    }
  }

  // Handle key events
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (selectedIndex >= 0 && suggestions.length > 0) {
        setCommand(suggestions[selectedIndex].pattern)
        setSuggestions([])
        setSelectedIndex(-1)
      } else {
        handleSubmitCommand()
      }
    } else if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault()
      setSelectedIndex(Math.min(selectedIndex + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault()
      setSelectedIndex(Math.max(selectedIndex - 1, -1))
    }
  }

  // Execute command
  const handleSubmitCommand = async () => {
    if (!command.trim()) return

    const newEntry = {
      type: 'input',
      text: command,
      timestamp: new Date().toLocaleTimeString()
    }

    setHistory((prev) => [...prev, newEntry])
    setCommand('')
    setSuggestions([])

    // Parse and execute command
    const cmdParts = command.toLowerCase().split(' ')
    const baseCommand = cmdParts.slice(0, 2).join(' ')

    let handler = null
    if (command === '/help') {
      handler = handleHelp
    } else if (command === '/clear') {
      handler = handleClear
      return
    } else {
      handler = commands.find((cmd) =>
        baseCommand.startsWith(cmd.pattern.split('[')[0].toLowerCase())
      )?.handler
    }

    if (handler) {
      try {
        const response = await handler(cmdParts.slice(1))
        addOutputMessage(response)
      } catch (error) {
        addOutputMessage(`❌ Error: ${error.message}`, 'error')
      }
    } else {
      addOutputMessage(
        `❌ Command not found. Type /help for available commands.`,
        'error'
      )
    }
  }

  // Add output message to history
  const addOutputMessage = (text, type = 'success') => {
    const newEntry = {
      type: 'output',
      text,
      messageType: type,
      timestamp: new Date().toLocaleTimeString()
    }
    setHistory((prev) => [...prev, newEntry])
  }

  // Command handlers
  async function handleHRStatus() {
    const people = await getAllFromDB(STORES.people)
    const checkIns = await getAllFromDB(STORES.checkIns)
    const tasks = await getAllFromDB(STORES.tasks)

    const wellbeingByPerson = {}
    people.forEach((p) => {
      const recent = checkIns
        .filter((c) => c.personId === p.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      wellbeingByPerson[p.name] = recent?.mood || '？'
    })

    const output = `
✅ Team Status Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 Team Members: ${people.length}
📊 Active Tasks: ${tasks.filter((t) => t.status === 'in-progress').length}

Recent Wellbeing:
${Object.entries(wellbeingByPerson)
  .map(([name, score]) => `  • ${name}: ${score === '？' ? '？' : score + '/10'}`)
  .join('\n')}
`
    return output.trim()
  }

  async function handleCheckIn(args) {
    if (args.length < 2) {
      throw new Error('Usage: /hr check-in [name] [score:1-10]')
    }

    const name = args[0]
    const score = parseInt(args[1])

    if (score < 1 || score > 10) {
      throw new Error('Score must be between 1 and 10')
    }

    const people = await getAllFromDB(STORES.people)
    const person = people.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))

    if (!person) {
      throw new Error(`Person "${name}" not found`)
    }

    const checkIn = {
      id: generateID('checkin'),
      personId: person.id,
      date: new Date().toISOString(),
      mood: score,
      notes: ''
    }

    await addToDB(STORES.checkIns, checkIn)
    return `✅ Check-in recorded for ${person.name}: ${score}/10`
  }

  async function handleBlocker(args) {
    if (args.length < 2) {
      throw new Error('Usage: /hr blocker [name] [issue]')
    }

    const name = args[0]
    const issue = args.slice(1).join(' ')

    const people = await getAllFromDB(STORES.people)
    const person = people.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))

    if (!person) {
      throw new Error(`Person "${name}" not found`)
    }

    const workLog = {
      id: generateID('worklog'),
      personId: person.id,
      date: new Date().toISOString().split('T')[0],
      status: 'blocked',
      blockers: issue,
      hoursWorked: 0
    }

    await addToDB(STORES.workLogs, workLog)
    return `⚠️ Blocker recorded for ${person.name}: "${issue}"`
  }

  async function handleOffer(args) {
    if (args.length === 0) {
      throw new Error('Usage: /hr offer [candidate name]')
    }

    const candidateName = args.join(' ')
    const hiring = await getAllFromDB(STORES.hiringPipeline)
    const candidate = hiring.find((h) =>
      h.name.toLowerCase().includes(candidateName.toLowerCase())
    )

    if (!candidate) {
      throw new Error(`Candidate "${candidateName}" not found`)
    }

    if (!candidate.offerSalary) {
      throw new Error(`No offer details for ${candidate.name}`)
    }

    const updated = { ...candidate, stage: 'offered', offerSentDate: new Date().toISOString().split('T')[0] }
    await updateInDB(STORES.hiringPipeline, updated)

    return `✅ Offer sent to ${candidate.name} - $${candidate.offerSalary}/year`
  }

  async function handleTimeOff(args) {
    if (args.length < 2) {
      throw new Error('Usage: /hr timeoff [name] [days]')
    }

    const name = args[0]
    const days = parseInt(args[1])

    const people = await getAllFromDB(STORES.people)
    const person = people.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))

    if (!person) {
      throw new Error(`Person "${name}" not found`)
    }

    const startDate = new Date()
    const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000)

    const timeOff = {
      id: generateID('timeoff'),
      personId: person.id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      type: 'vacation',
      reason: 'Time off',
      approvalStatus: 'approved'
    }

    await addToDB(STORES.timeOff, timeOff)
    return `🏖️ Time off recorded for ${person.name}: ${days} days (${timeOff.startDate} to ${timeOff.endDate})`
  }

  async function handleMeeting(args) {
    if (args.length === 0) {
      throw new Error('Usage: /hr meeting [name]')
    }

    const name = args.join(' ')
    const people = await getAllFromDB(STORES.people)
    const person = people.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))

    if (!person) {
      throw new Error(`Person "${name}" not found`)
    }

    const meeting = {
      id: generateID('1o1'),
      personId: person.id,
      personName: person.name,
      managerId: '',
      managerName: '',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduledTime: '10:00',
      duration: 30,
      meetingType: 'regular',
      status: 'scheduled'
    }

    await addToDB(STORES.oneOnOnes, meeting)
    return `📅 1:1 meeting scheduled with ${person.name} for tomorrow at 10:00 AM`
  }

  async function handleTask(args) {
    if (args.length < 3) {
      throw new Error('Usage: /hr task [name] [title] [hours]')
    }

    const name = args[0]
    const title = args[1]
    const hours = parseInt(args[2])

    const people = await getAllFromDB(STORES.people)
    const person = people.find((p) => p.name.toLowerCase().includes(name.toLowerCase()))

    if (!person) {
      throw new Error(`Person "${name}" not found`)
    }

    const task = {
      id: generateID('task'),
      title: title,
      assigneeId: person.id,
      status: 'todo',
      estimatedHours: hours,
      createdDate: new Date().toISOString()
    }

    await addToDB(STORES.tasks, task)
    return `✅ Task assigned to ${person.name}: "${title}" (${hours}h estimated)`
  }

  function handleHelp() {
    const help = `
📚 Available Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${commands.map((cmd) => `  ${cmd.pattern.padEnd(35)} - ${cmd.description}`).join('\n')}

💡 Examples:
  /hr status
  /hr check-in Alice 8
  /hr blocker Bob "Database connection"
  /hr offer "Sarah Johnson"
  /hr timeoff Charlie 3
  /hr meeting David
  /hr task Eve "Fix login bug" 5
`
    return help.trim()
  }

  function handleClear() {
    setHistory([])
    addOutputMessage('Console cleared.')
    return null
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-bold">Slack Commands Console</h1>
        </div>
        <p className="text-xs text-gray-400 mt-1">Quick actions for HR operations • Type /help for commands</p>
      </div>

      {/* Console Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm bg-gray-950 space-y-2"
      >
        {history.length === 0 ? (
          <div className="text-gray-600 mt-8">
            <p>🚀 YuvaHive HR Console v1.0</p>
            <p>Type /help to see available commands</p>
            <p className="mt-2">$ </p>
          </div>
        ) : (
          history.map((entry, idx) => (
            <div key={idx}>
              {entry.type === 'input' ? (
                <div className="text-purple-400">
                  <span>$ {entry.text}</span>
                </div>
              ) : (
                <div
                  className={`whitespace-pre-wrap ${
                    entry.messageType === 'error' ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {entry.text}
                </div>
              )}
            </div>
          ))
        )}
        <div className="text-purple-400">$ </div>
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && (
        <div className="bg-slate-800 border-t border-slate-700 max-h-32 overflow-y-auto">
          {suggestions.map((cmd, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 cursor-pointer text-sm ${
                idx === selectedIndex
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-slate-700 text-gray-300'
              }`}
              onClick={() => {
                setCommand(cmd.pattern)
                setSuggestions([])
              }}
            >
              <span className="text-purple-400">{cmd.pattern}</span>
              <span className="text-gray-500 text-xs ml-2">{cmd.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-slate-800 border-t border-slate-700 p-3 flex gap-2 items-center">
        <span className="text-purple-400">$</span>
        <input
          ref={inputRef}
          type="text"
          value={command}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a command (/help for list)"
          className="flex-1 bg-transparent text-white outline-none text-sm"
          autoFocus
        />
        <button
          onClick={handleSubmitCommand}
          className="p-2 hover:bg-purple-600 rounded transition-colors"
          title="Send command"
        >
          <Send className="w-4 h-4 text-purple-400" />
        </button>
      </div>
    </div>
  )
}
