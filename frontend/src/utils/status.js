export const PROJECT_STATUS = {
  pending: { label: 'در انتظار تأیید', class: 'badge-warning' },
  approved: { label: 'تأیید شده', class: 'badge-success' },
  supervisor_assigned: { label: 'استاد راهنما تعیین شده', class: 'badge-info' },
  topic_proposal: { label: 'پیشنهاد موضوع', class: 'badge-warning' },
  topic_approved: { label: 'موضوع تأیید شده', class: 'badge-success' },
  in_progress: { label: 'در حال انجام', class: 'badge-info' },
  defense_scheduled: { label: 'زمان دفاع تعیین شده', class: 'badge-info' },
  completed: { label: 'تکمیل شده', class: 'badge-success' },
  rejected: { label: 'رد شده', class: 'badge-danger' }
}

export const MAJORS = [
  'کامپیوتر',
  'برق',
  'مکانیک',
  'عمران',
  'شیمی',
  'صنایع'
]

export function getStatusLabel(status) {
  return PROJECT_STATUS[status]?.label || status
}

export function getStatusClass(status) {
  return PROJECT_STATUS[status]?.class || 'badge-info'
}
