const fs = require('fs');
let c = fs.readFileSync('src/components/programme/programme-agenda-client.jsx', 'utf8');

c = c.replace(
  `session{sessionsWithCalendar.length !== 1 ? 's' : ''}</span>                All Days`,
  `session{sessionsWithCalendar.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="day-tabs">
          <div className="shell day-tabs-inner">
            <button
              className={\`day-tab \${activeDay === 'all' ? 'active' : ''}\`}
              onClick={() => setActiveDay('all')}
            >
              All Days`
);

fs.writeFileSync('src/components/programme/programme-agenda-client.jsx', c);
console.log("Fixed!");
