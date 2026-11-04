const DAY = 86400000;

// A calendar date is not an exact release time. Keep it in the source timezone,
// include its whole day, and only use whole days in its countdown.
export function deadlineState(deadlines, now = Date.now(), estimated = false, dateOffset = '-12:00') {
  const milestones = deadlines.map((deadline, index) => {
    const dateOnly = !deadline.at && Boolean(deadline.date);
    const start = Date.parse(deadline.at || (deadline.date ? `${deadline.date}T00:00:00${dateOffset}` : ''));
    const end = dateOnly ? Date.parse(`${deadline.end_date || deadline.date}T00:00:00${dateOffset}`) + DAY : start;
    const active = dateOnly && start <= now && now < end;
    const boundary = dateOnly ? deadline.end_date ? active ? 'end' : 'start' : 'date' : 'deadline';
    return {
      ...deadline, index, kind: deadline.kind || 'submission', dateOnly, dateOffset,
      start, end, active, elapsed: Number.isFinite(end) && end <= now,
      boundary,
      targetDate: boundary === 'end' ? deadline.end_date : deadline.date,
      timestamp: boundary === 'end' ? end : start,
    };
  });
  const dated = milestones.filter(({ end }) => Number.isFinite(end));
  const next = dated.filter(({ elapsed }) => !elapsed).sort((a, b) => a.timestamp - b.timestamp)[0];
  const pending = dated.length < milestones.length || milestones.length === 0;
  const isEstimate = estimated && dated.length > 0;
  const group = next ? 'upcoming' : isEstimate || pending ? 'pending' : 'past';
  return {
    status: isEstimate ? 'estimated' : group,
    group, next, milestones,
    sortTime: next?.timestamp ?? (group === 'past' ? Math.max(...dated.map(({ end }) => end)) : Infinity),
    // Registration warnings only apply while submission is still possible.
    closedPrerequisite: !isEstimate && next?.kind === 'submission'
      ? dated.filter((deadline) => deadline.prerequisite && deadline.elapsed).sort((a, b) => b.end - a.end)[0]
      : undefined,
  };
}

export function milestoneCountdown(milestone, now = Date.now()) {
  if (!milestone.dateOnly) return formatCountdown(milestone.timestamp - now);
  const offset = Date.parse(`1970-01-01T00:00:00${milestone.dateOffset}`);
  const today = new Date(now - offset).toISOString().slice(0, 10);
  const days = Math.max(0, Math.round((Date.parse(milestone.targetDate) - Date.parse(today)) / DAY));
  return days === 0 ? 'Today' : `${days} ${days === 1 ? 'day' : 'days'}`;
}

export function formatCalendarDate(date, endDate) {
  // UTC here preserves the date string; it does not convert an unknown time.
  const format = (value, options) => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC', day: '2-digit', ...options,
  }).format(new Date(`${value}T00:00:00Z`));
  const sameYear = endDate && date.slice(0, 4) === endDate.slice(0, 4);
  const sameMonth = sameYear && date.slice(0, 7) === endDate.slice(0, 7);
  return {
    start: format(date, { ...(!sameMonth && { month: 'short' }), ...(!sameYear && { year: 'numeric' }) }),
    end: endDate ? format(endDate, { month: 'short', year: 'numeric' }) : '',
  };
}

export function formatCountdown(milliseconds) {
  if (milliseconds <= 0) return 'Closed';
  const day = 86400000;
  if (milliseconds > 7 * day) return `${Math.floor(milliseconds / day)} days`;
  const minutes = Math.ceil(milliseconds / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return `${days}d ${hours}h ${minutes % 60}m`;
}

export function formatDeadline(instant, timezone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(instant)).map(({ type, value }) => [type, value]));
  return `${parts.day} ${parts.month} ${parts.year} · ${parts.hour}:${parts.minute}`;
}

function initialize(board) {
  const dateOffset = board.dataset.dateOffset;
  const dateZone = board.dataset.dateZone;
  const controls = board.querySelector('.deadline-controls');
  const timezoneButtons = [...board.querySelectorAll('button[data-timezone]')];
  const groups = Object.fromEntries(['upcoming', 'pending', 'past'].map((status) => [status, {
    section: board.querySelector(`[data-deadline-section="${status}"]`),
    list: board.querySelector(`[data-deadline-list="${status}"]`),
  }]));
  const cards = [...board.querySelectorAll('[data-conference-id]')].map((element) => ({
    element,
    estimated: element.dataset.estimated === 'true',
    milestones: [...element.querySelectorAll('.deadline-milestone')].map((row) => {
      const [time, endTime] = row.querySelectorAll('time');
      return {
        time, endTime, row,
        at: row.dataset.at,
        date: row.dataset.date,
        end_date: row.dataset.endDate,
        kind: row.dataset.kind,
        referenceAt: time?.dataset.referenceAt,
        referenceDate: row.dataset.referenceDate,
        referenceEndDate: row.dataset.referenceEndDate,
        label: row.querySelector('.deadline-milestone-label')?.textContent || 'Submission',
        prerequisite: row.dataset.prerequisite === 'true',
        closed_message: row.dataset.closedMessage,
      };
    }),
    countdown: element.querySelector('.deadline-countdown'),
    value: element.querySelector('.deadline-countdown-value'),
    prerequisiteNote: element.querySelector('.deadline-prerequisite-note'),
  }));
  let timezone = 'Asia/Shanghai';
  let layoutSignature = '';
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const localButton = timezoneButtons.find((button) => button.dataset.timezone === 'local');
  localButton.title = localTimezone.replaceAll('_', ' ');
  localButton.setAttribute('aria-label', `Local (${localButton.title})`);
  try {
    const saved = localStorage.getItem('yifan-deadlines-timezone');
    if (timezoneButtons.some((button) => button.dataset.timezone === saved)) timezone = saved;
  } catch { /* Timezone conversion also works without storage. */ }

  function updateTimes() {
    const zone = timezone === 'local' ? localTimezone : timezone;
    cards.forEach((card) => card.milestones.forEach(({ time, endTime, at, date, end_date, referenceAt, referenceDate, referenceEndDate }) => {
      if (at) {
        time.textContent = formatDeadline(at, zone);
        if (referenceAt) time.title = `Estimated from ${formatDeadline(referenceAt, zone)} (${zone}). Official dates pending.`;
      } else if (date) {
        const formatted = formatCalendarDate(date, end_date);
        time.textContent = formatted.start;
        if (endTime) endTime.textContent = formatted.end;
        if (referenceDate) {
          const reference = formatCalendarDate(referenceDate, referenceEndDate);
          time.parentElement.title = `Estimated from ${reference.start}${reference.end ? `–${reference.end}` : ''} (${dateZone}). Official dates pending.`;
        }
      }
    }));
    timezoneButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.timezone === timezone)));
  }

  function updateLayout() {
    for (const [status, group] of Object.entries(groups)) {
      const members = cards.filter((card) => card.state.group === status).sort((a, b) => {
        const difference = a.state.sortTime - b.state.sortTime;
        return (status === 'past' ? -difference : difference) || a.element.id.localeCompare(b.element.id);
      });
      members.forEach((card, index) => {
        // Preserve focus on links: don't detach cards when their order hasn't changed.
        if (group.list.children[index] !== card.element) {
          group.list.insertBefore(card.element, group.list.children[index] || null);
        }
      });
      group.section.hidden = members.length === 0;
    }
  }

  function tick() {
    const now = Date.now();
    cards.forEach((card) => {
      const state = deadlineState(card.milestones, now, card.estimated, dateOffset);
      card.state = state;
      card.element.dataset.status = state.status;
      card.element.classList.toggle('deadline-soon', state.status === 'upcoming' && state.next.timestamp - now < 7 * 86400000);
      const value = state.next ? milestoneCountdown(state.next, now) : state.status === 'estimated' ? 'Estimate passed' : state.status === 'pending' ? 'TBA' : 'Past';
      if (card.value.textContent !== value) card.value.textContent = value;
      card.countdown.hidden = false;
      const phase = state.next?.boundary === 'start' ? 'Starts' : state.next?.boundary === 'end' ? 'Ends' : state.next?.active ? 'Today' : 'Next';
      card.countdown.setAttribute('aria-label', state.next ? `${state.next.label}, ${phase.toLowerCase()}: ${value}` : value);
      if (state.next) card.countdown.setAttribute('aria-describedby', state.next.row.id);
      else card.countdown.removeAttribute('aria-describedby');
      state.milestones.forEach(({ index, row, elapsed }) => {
        const current = index === state.next?.index;
        row.classList.toggle('deadline-milestone-closed', elapsed);
        row.classList.toggle('deadline-milestone-next', current);
      });
      const prerequisite = state.status === 'upcoming' && state.closedPrerequisite;
      card.prerequisiteNote.hidden = !prerequisite;
      card.prerequisiteNote.textContent = prerequisite ? prerequisite.closed_message : '';
    });
    const signature = cards.map((card) => `${card.state.group}:${card.state.sortTime}`).join('|');
    if (signature !== layoutSignature) {
      layoutSignature = signature;
      updateLayout();
    }
  }

  timezoneButtons.forEach((button) => button.addEventListener('click', () => {
    timezone = button.dataset.timezone;
    updateTimes();
    try { localStorage.setItem('yifan-deadlines-timezone', timezone); } catch { /* Optional preference. */ }
  }));
  const pageHeader = board.closest('.post')?.querySelector('.post-header');
  if (pageHeader) {
    pageHeader.classList.add('deadline-page-header');
    pageHeader.append(controls);
  }
  updateTimes();
  tick();
  controls.hidden = false;
  // Refresh on return as well: browsers throttle timers in background tabs.
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  window.setInterval(() => { if (!document.hidden) tick(); }, 1000);
}

if (typeof document !== 'undefined') {
  const board = document.querySelector('[data-deadline-board]');
  if (board) initialize(board);
}
