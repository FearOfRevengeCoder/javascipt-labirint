let consoleTimeout;
let consoleCollapsed = false;

document.getElementById('console').addEventListener('mouseover', () => {
  clearTimeout(consoleTimeout);
  consoleCollapsed = false;
  document.getElementById('console').classList.remove('collapsed');
  document.getElementById('console-toggle-button').style.display = 'none';
});

document.getElementById('console').addEventListener('mouseout', () => {
  consoleTimeout = setTimeout(() => {
    consoleCollapsed = true;
    document.getElementById('console').classList.add('collapsed');
    document.getElementById('console-toggle-button').style.display = 'block';
  }, 300);
});

document.getElementById('console-toggle-button').addEventListener('click', () => {
  if (consoleCollapsed) {
    consoleCollapsed = false;
    document.getElementById('console').classList.remove('collapsed');
    document.getElementById('console-toggle-button').style.display = 'none';
  }
});
