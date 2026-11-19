(() => {
'use strict';
const destinations = {growth:'growth.html',work:'work.html',decisions:'decisions.html',leadership:'leadership.html',career:'career.html','sales-detail':'work.html#sales-detail'};
const home = /(?:\/|\/index\.html)$/.test(location.pathname);
const id = location.hash.slice(1);
if (home && destinations[id]) { location.replace(destinations[id]); return; }
if (id) {
 const target = document.getElementById(id);
 if (target) {
  let parent = target.parentElement;
  while (parent) { if(parent.tagName === 'DETAILS') parent.open=true; parent=parent.parentElement; }
  if(target.tagName === 'DETAILS') target.open=true;
 }
}
})();
