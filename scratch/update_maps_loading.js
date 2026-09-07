const fs = require('fs');

const f1 = 'frontend/components/CreateLead.jsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(
  'script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;',
  'script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&loading=async`;'
);
fs.writeFileSync(f1, c1, 'utf8');
console.log('Updated CreateLead.jsx Google Maps url');

const f2 = 'frontend/modules/super-admin/pages/SuperAdminLiveMapPage.jsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(
  'script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;',
  'script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&loading=async`;'
);
fs.writeFileSync(f2, c2, 'utf8');
console.log('Updated SuperAdminLiveMapPage.jsx Google Maps url');
