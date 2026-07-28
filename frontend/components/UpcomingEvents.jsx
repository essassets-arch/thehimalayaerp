
const FOLLOWUPS_DATA = [
  { id: 1, date: 'Monday 22nd Jun, 2025', title: 'Payment due for Nexus Tech Ltd' },
  { id: 2, date: 'Friday 11th Aug, 2025', title: 'Follow-up call with Global Infra Corp' },
  { id: 3, date: 'Tuesday 19th Aug, 2025', title: 'Dispatch order #ORD-801 to Titan Industries' },
  { id: 4, date: 'Friday 3rd Sep, 2025', title: 'Send sample feedback to Alpha Logistics' },
  { id: 5, date: 'Wednesday 12th Oct, 2025', title: 'Renew annual contract with Alpha Logistics' },
  { id: 6, date: 'Thursday 28th Nov, 2025', title: 'Quarter-end sales target wrap-up' },
];

export default function UpcomingEvents({ onViewAllClick, onEventActionClick }) {
  return (
    <div className="app-card events-card">
      <div className="events-heading-row">
        <h2 className="card-heading">Upcoming Follow-ups</h2>
        <button 
          className="events-view-all" 
          id="eventsViewAll"
          onClick={() => onViewAllClick('Follow-ups View All', 'Opening Full Calendars schedule')}
        >
          View All
        </button>
      </div>
      <span className="events-subheading">Scheduled client appointments and invoice dues!</span>
      
      <div className="events-scroll-area">
        {FOLLOWUPS_DATA.map((event) => (
          <div key={event.id} className="event-card-item">
            <div className="event-info">
              <span className="event-date-text">{event.date}</span>
              <span className="event-title-text">{event.title}</span>
            </div>
            <span 
              className="event-action-dots"
              onClick={() => onEventActionClick(`Actions for: ${event.title}`)}
            >
              ⋮
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
