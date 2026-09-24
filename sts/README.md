# Student IT Field Services

STS is a campus IT operations website that brings everyday support work into one place. It helps student technicians record work, track equipment and deliveries, inspect classrooms, monitor printers, and keep a team informed.

## Explore the project

- **Worker dashboard:** activity charts, daily checks, announcements and field-work reporting.
- **Equipment and deliveries:** equipment returns, four delivery categories and e-waste bin tracking.
- **Room checks:** building selection, previously checked rooms, equipment checklists and notes.
- **Printer dashboard:** campus switching, consumable levels, individual checks and simulated full scans.
- **Admin dashboard:** field-work approval, announcement publishing, demo user management, semester dates and printable e-waste records.
- **Reporting:** searchable records, expandable tables, pagination and CSV downloads.
- **Monitoring:** fictional lab workstations and computer imaging progress.
- **Feedback:** star ratings and service assessment.

The portfolio copy retains the original styling, navigation, theme switching, page layouts and interactions. It uses fictional records instead of operational data. Open `index.html` through a static web server to choose the worker or admin experience; no login is required.

## Demo behavior

Submissions update the related screens in the same browser tab. The profile menu provides **Reset demo data**. Admin controls edit fictional records only. Printer scans, lab monitoring, imaging and the AV controller are simulations; they never contact real devices. Feedback stays in the demo and is not sent to anyone.

There is no database, PHP runtime, external API, webhook or server write. All display libraries and fonts are included locally. The folder works at a website root or inside a portfolio subdirectory. Local preview requires HTTP/HTTPS rather than opening files directly because the shared sidebar and documentation use local fetch requests.


