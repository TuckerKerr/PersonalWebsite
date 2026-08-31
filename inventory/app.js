const deliveryTypes = ['Laptops', 'Desktops', 'Monitors', 'Peripherals', 'Printers', 'AV'];
let inventoryData = [], tonerData = [], equipmentData = [];
let selectedInventoryIndex = null;

document.addEventListener('DOMContentLoaded', async function () {
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('Unable to load JSON data.');
    const json = await response.json();
    inventoryData = json.inventory; tonerData = json.toner; equipmentData = json.open_equipment;
    TableLoader(); TonerTableLoader(); EQTableLoader();
  } catch (error) { showNotification(error.message, true); }
});

function TableLoader() {
  const columns = ['box-left-column', 'box-left-column', 'box-middle-column', 'box-middle-column', 'box-right-column', 'box-right-column'];
  document.getElementById('inventoryGrid').innerHTML = deliveryTypes.map((type, index) => `<div class="${columns[index]} inventory-column"><div class="box"><div class="box-header"><h2>${type}</h2></div><div class="box-content"><div class="tablewrapper"><table id="${type}table" border="1"><thead><tr><th>Quantity</th><th>Model</th><th>Campus</th></tr></thead><tbody></tbody></table></div></div></div></div>`).join('');
  deliveryTypes.forEach(type => document.querySelector(`#${type}table tbody`).innerHTML = inventoryData.filter(item => item.delivery_type === type).map(item => {
    const index = inventoryData.indexOf(item);
    return `<tr><td style="text-align:right;"><span style="display:flex; justify-content:space-between;">${item.quantity}<span><button data-role="${item.delivery_type}" data-campus="${item.campus}" class="action-btn" onclick="showPopupDelete(${index})" aria-label="Remove ${escapeHTML(item.model)}"><i class="fa-solid fa-minus"></i></button><button data-role="${item.delivery_type}" data-campus="${item.campus}" class="action-btn" onclick="showPopupAdd(${index})" aria-label="Add ${escapeHTML(item.model)}"><i class="fa-solid fa-plus"></i></button></span></span></td><td>${escapeHTML(item.model)}</td><td>${escapeHTML(item.campus)}</td></tr>`;
  }).join(''));
}

function showPopupAdd(index) { selectedInventoryIndex = index; document.getElementById('addItemName').textContent = inventoryData[index].model; showPopup('InputPopup'); }
function showPopupDelete(index) { selectedInventoryIndex = index; document.getElementById('removeItemName').textContent = inventoryData[index].model; showPopup('RemovePopup'); }

function TonerTableLoader(search = '') {
  const value = search.toLowerCase();
  document.querySelector('#tonerTable tbody').innerHTML = tonerData.filter(item => Object.values(item).some(field => String(field).toLowerCase().includes(value))).map(item => `<tr><td>${escapeHTML(item.sticker_id)}</td><td>${escapeHTML(item.toner_id)}</td><td>${escapeHTML(item.printer_model)}</td><td>${escapeHTML(item.color)}</td><td>${escapeHTML(item.located)}</td></tr>`).join('');
}

function EQTableLoader(search = '') {
  const value = search.toLowerCase();
  document.querySelector('#eqTable tbody').innerHTML = equipmentData.filter(item => Object.values(item).some(field => String(field).toLowerCase().includes(value))).map(item => `<tr><td>${escapeHTML(item.asset_tag)}</td><td>${escapeHTML(item.eq_type)}</td><td>${escapeHTML(item.eq_model)}</td><td>${escapeHTML(item.location)}</td><td>${escapeHTML(item.campus)}</td></tr>`).join('');
}

document.getElementById('searchInput').addEventListener('input', event => TonerTableLoader(event.target.value));
document.getElementById('EQsearchInput').addEventListener('input', event => EQTableLoader(event.target.value));
document.getElementById('themeToggle').addEventListener('change', event => document.body.classList.toggle('dark-theme', event.target.checked));
document.getElementById('profileIcon').addEventListener('click', () => document.getElementById('dropdown').classList.toggle('show'));
document.getElementById('menuIcon').addEventListener('click', () => document.getElementById('menudropdown').classList.toggle('show'));
document.getElementById('addModelButton').addEventListener('click', () => showPopup('ModelAdd'));
document.getElementById('addTonerButton').addEventListener('click', () => showPopup('TonerAdd'));
document.getElementById('addEquipmentButton').addEventListener('click', () => showPopup('EquipmentAdd'));
document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => closePopup(button.dataset.close)));

document.getElementById('ModelForm').addEventListener('submit', event => {
  event.preventDefault(); const form = new FormData(event.target); const action = event.submitter.value;
  if (action === 'add') inventoryData.push({ quantity: 0, model: form.get('model'), campus: form.get('campus'), delivery_type: form.get('type') });
  else { const index = inventoryData.findIndex(item => item.model.toLowerCase() === String(form.get('model')).toLowerCase() && item.campus === form.get('campus') && item.delivery_type === form.get('type')); if (index < 0) return showNotification('Model not found.', true); inventoryData.splice(index, 1); }
  TableLoader(); finishDemoAction(event.target, `Model ${action === 'add' ? 'added' : 'removed'} for this demo session.`, 'ModelAdd');
});
document.getElementById('AddQuantityForm').addEventListener('submit', event => { event.preventDefault(); const amount = Number(new FormData(event.target).get('quantity')); inventoryData[selectedInventoryIndex].quantity += amount; TableLoader(); finishDemoAction(event.target, `${amount} item${amount === 1 ? '' : 's'} added.`, 'InputPopup'); });
document.getElementById('RemoveQuantityForm').addEventListener('submit', event => { event.preventDefault(); const amount = Number(new FormData(event.target).get('quantity')); const item = inventoryData[selectedInventoryIndex]; if (amount > item.quantity) return showNotification("You're trying to take out too many items.", true); item.quantity -= amount; TableLoader(); finishDemoAction(event.target, `${amount} item${amount === 1 ? '' : 's'} removed.`, 'RemovePopup'); });
document.getElementById('TonerAddForm').addEventListener('submit', event => {
  event.preventDefault(); tonerData.push(Object.fromEntries(new FormData(event.target)));
  TonerTableLoader(); finishDemoAction(event.target, 'Toner added for this demo session.', 'TonerAdd');
});
document.getElementById('EquipmentAddForm').addEventListener('submit', event => {
  event.preventDefault(); equipmentData.push(Object.fromEntries(new FormData(event.target)));
  EQTableLoader(); finishDemoAction(event.target, 'Equipment added for this demo session.', 'EquipmentAdd');
});

function showPopup(id) { document.getElementById(id).style.display = 'flex'; document.body.classList.add('modal-open'); }
function closePopup(id) { document.getElementById(id).style.display = 'none'; document.body.classList.remove('modal-open'); }
function finishDemoAction(form, message, popup) { form.reset(); closePopup(popup); showNotification(message); }
function showNotification(message, error = false) { const note = document.getElementById('notification'); note.textContent = message; note.style.backgroundColor = error ? '#b91c1c' : '#166534'; note.style.display = 'block'; setTimeout(() => note.style.display = 'none', 2800); }
function escapeHTML(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]); }
