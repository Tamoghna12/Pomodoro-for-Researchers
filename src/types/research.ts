export type ResearchSessionType =
  | 'literature-review'
  | 'writing'
  | 'data-analysis'
  | 'methodology-planning'
  | 'admin-tasks'
  | 'teaching-prep'
  | 'collaboration'
  | 'lab-work'
  | 'grant-writing'
  | 'peer-review'
  | 'conference-prep'
  | 'deep-focus'

export interface ResearchSession {
  id: string
  type: ResearchSessionType
  title: string
  project?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  deadline?: Date
  estimatedPomodoros: number
  completedPomodoros: number
  notes: string[]
  collaborators?: string[]
  tags: string[]
  createdAt: Date
  lastWorkedOn?: Date
  status: 'planned' | 'in-progress' | 'completed' | 'paused'
}

export interface ResearchProject {
  id: string
  title: string
  description: string
  type: 'research' | 'teaching' | 'admin' | 'collaboration'
  status: 'planning' | 'active' | 'review' | 'completed'
  deadline?: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
  totalPomodoros: number
  sessions: ResearchSession[]
  collaborators: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface AcademicWorkload {
  research: number // percentage of time
  teaching: number
  admin: number
  service: number
  collaboration: number
}

export interface ProductivityInsight {
  type: 'time-distribution' | 'peak-hours' | 'session-efficiency' | 'workload-balance'
  title: string
  description: string
  recommendation: string
  data: Record<string, any>
  confidence: number
  timeframe: 'daily' | 'weekly' | 'monthly'
}

export const RESEARCH_SESSION_TYPES: Record<ResearchSessionType, {
  name: string
  description: string
  suggestedDuration: number // in minutes
  icon: string
  color: string
  aiPrompts: string[]
  tips: string[]
}> = {
  'literature-review': {
    name: 'Literature Review',
    description: 'Reading papers, taking notes, analyzing existing research',
    suggestedDuration: 45,
    icon: '📚',
    color: 'blue',
    aiPrompts: [
      'Summarize key findings from this paper',
      'Compare methodologies across these studies',
      'Identify research gaps in this literature'
    ],
    tips: [
      'Take structured notes with key themes',
      'Use citation manager as you go',
      'Set specific research questions before starting'
    ]
  },
  'writing': {
    name: 'Academic Writing',
    description: 'Drafting papers, proposals, thesis chapters',
    suggestedDuration: 50,
    icon: '✍️',
    color: 'green',
    aiPrompts: [
      'Help improve this paragraph clarity',
      'Suggest transitions between sections',
      'Check argument structure and flow'
    ],
    tips: [
      'Set daily word count goals',
      'Write first, edit later',
      'Use the active voice when possible'
    ]
  },
  'data-analysis': {
    name: 'Data Analysis',
    description: 'Statistical analysis, coding, data visualization',
    suggestedDuration: 60,
    icon: '📊',
    color: 'purple',
    aiPrompts: [
      'Explain this statistical test appropriateness',
      'Help interpret these results',
      'Suggest visualization for this data'
    ],
    tips: [
      'Document your analysis steps',
      'Version control your code',
      'Validate results with multiple approaches'
    ]
  },
  'methodology-planning': {
    name: 'Methodology Design',
    description: 'Planning research design, protocols, procedures',
    suggestedDuration: 40,
    icon: '🔬',
    color: 'orange',
    aiPrompts: [
      'Review this research design for validity',
      'Suggest controls for this study',
      'Help plan data collection procedures'
    ],
    tips: [
      'Consider ethical implications early',
      'Plan for potential confounding variables',
      'Estimate sample size requirements'
    ]
  },
  'admin-tasks': {
    name: 'Administrative Work',
    description: 'Emails, reports, documentation, bureaucracy',
    suggestedDuration: 25,
    icon: '📋',
    color: 'gray',
    aiPrompts: [
      'Help draft this professional email',
      'Summarize these meeting notes',
      'Create task list from this document'
    ],
    tips: [
      'Batch similar tasks together',
      'Set specific time limits',
      'Use templates for recurring tasks'
    ]
  },
  'teaching-prep': {
    name: 'Teaching Preparation',
    description: 'Lesson planning, grading, course development',
    suggestedDuration: 35,
    icon: '🎓',
    color: 'indigo',
    aiPrompts: [
      'Create engaging examples for this concept',
      'Design assessment questions',
      'Suggest interactive teaching methods'
    ],
    tips: [
      'Align activities with learning objectives',
      'Prepare backup plans for technical issues',
      'Build in active learning opportunities'
    ]
  },
  'collaboration': {
    name: 'Collaboration Time',
    description: 'Meetings, discussions, co-working sessions',
    suggestedDuration: 30,
    icon: '🤝',
    color: 'teal',
    aiPrompts: [
      'Prepare agenda for this meeting',
      'Summarize action items from discussion',
      'Draft follow-up communication'
    ],
    tips: [
      'Set clear objectives beforehand',
      'Assign action items with deadlines',
      'Follow up within 24 hours'
    ]
  },
  'lab-work': {
    name: 'Laboratory Work',
    description: 'Experiments, data collection, equipment setup',
    suggestedDuration: 90,
    icon: '🧪',
    color: 'red',
    aiPrompts: [
      'Help troubleshoot this experimental issue',
      'Suggest protocol modifications',
      'Calculate reagent concentrations'
    ],
    tips: [
      'Prepare all materials beforehand',
      'Document everything immediately',
      'Have backup plans for equipment failure'
    ]
  },
  'grant-writing': {
    name: 'Grant Writing',
    description: 'Funding proposals, budget planning, application prep',
    suggestedDuration: 60,
    icon: '💰',
    color: 'yellow',
    aiPrompts: [
      'Help strengthen this research rationale',
      'Review budget justification',
      'Improve project timeline clarity'
    ],
    tips: [
      'Start with specific aims first',
      'Get feedback early and often',
      'Follow guidelines exactly'
    ]
  },
  'peer-review': {
    name: 'Peer Review',
    description: 'Reviewing manuscripts, proposals, applications',
    suggestedDuration: 45,
    icon: '👥',
    color: 'pink',
    aiPrompts: [
      'Help structure constructive feedback',
      'Assess methodology rigor',
      'Suggest improvements for clarity'
    ],
    tips: [
      'Be constructive, not just critical',
      'Focus on major issues first',
      'Provide specific, actionable suggestions'
    ]
  },
  'conference-prep': {
    name: 'Conference Preparation',
    description: 'Presentation creation, poster design, abstract writing',
    suggestedDuration: 40,
    icon: '🎤',
    color: 'violet',
    aiPrompts: [
      'Help create compelling presentation outline',
      'Suggest visual elements for poster',
      'Review abstract for clarity and impact'
    ],
    tips: [
      'Practice your presentation timing',
      'Prepare for common questions',
      'Have backup slides for deeper discussion'
    ]
  },
  'deep-focus': {
    name: 'Deep Focus Work',
    description: 'Intensive thinking, problem-solving, creative work',
    suggestedDuration: 90,
    icon: '🧠',
    color: 'emerald',
    aiPrompts: [
      'Help break down this complex problem',
      'Suggest alternative approaches',
      'Brainstorm creative solutions'
    ],
    tips: [
      'Eliminate all distractions',
      'Work when your energy is highest',
      'Take longer breaks between sessions'
    ]
  }
}