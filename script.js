// ---------------------------------------------------------------------------------------------------------------------------------------
let allParks = [];
let currentPage = 1;
const itemsPerPage = 2;
let editingParkId = null

// === Mapa ===
const map = L.map('map').setView([51.505, -0.09], 13);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

async function registerPark() {
  await loadCheckboxOptions()
  await loadStateOptions()
}

function renderParks() {
  const parksList = document.getElementById("parksList");
  parksList.innerHTML = "";

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const parksToShow = allParks.slice(start, end);

  parksToShow.forEach((park) => {
    const col = document.createElement("div");
    col.className = "col-12 col-lg-6 mb-3";

    col.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="card-body">
          <h5 class="card-title">${park.name}</h5>
          <p class="card-text mb-1"><strong>Endereço:</strong> ${park.street}, ${park.city} - ${park.state}</p>
          <p class="card-text mb-1"><strong>Finalidade:</strong> ${park.purposes || "-"}</p>
          <p class="card-text mb-1"><strong>Estrutura:</strong> ${park.structures || "-"}</p>
          <p class="card-text mb-1"><strong>Acesso:</strong> ${park.access_name || "-"} (${park.access_description || ""})</p>
        </div>
        <div class="card-footer d-flex justify-content-between">
          <button class="btn btn-sm btn-outline-primary edit-btn"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger delete-btn"><i class="bi bi-trash"></i></button>
        </div>
      </div>
    `;

    const editBtn = col.querySelector(".edit-btn");
    editBtn.addEventListener("click", () => {
      editPark(park);
    });

    const deleteBtn = col.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      deletePark(park.id);
    });

    parksList.appendChild(col);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(allParks.length / itemsPerPage);

  // Prev
  const prevLi = document.createElement("li");
  prevLi.classList.add("page-item");
  if (currentPage === 1) prevLi.classList.add("disabled");
  prevLi.innerHTML = `<a class="page-link" href="#">Anterior</a>`;
  prevLi.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderParks();
      renderPagination();
    }
  });
  pagination.appendChild(prevLi);

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (i === currentPage) li.classList.add("active");
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", () => {
      currentPage = i;
      renderParks();
      renderPagination();
    });
    pagination.appendChild(li);
  }

  const nextLi = document.createElement("li");
  nextLi.classList.add("page-item");
  if (currentPage === totalPages) nextLi.classList.add("disabled");
  nextLi.innerHTML = `<a class="page-link" href="#">Próximo</a>`;
  nextLi.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderParks();
      renderPagination();
    }
  });
  pagination.appendChild(nextLi);
}

async function listParks() {
  try {
    const response = await fetch('http://127.0.0.1:5000/parques/');
    if (!response.ok) {
      throw new Error(`Erro ao buscar parques: ${response.status}`);
    }

    allParks = await response.json();
    currentPage = 1;
    const modal = new bootstrap.Modal(document.getElementById("listParksModal"));
    modal.show();

    renderParks();
    renderPagination();
    
  } catch (err) {
    console.error(err);
    alert("Não foi possível carregar os parques.");
  }
}

function filterParks() {
  alert("Filtrar parques");
}

function renderCheckboxGroup(containerId, name, options) {
    const container = document.getElementById(containerId);
    if (name !== 'acesso') {
        container.innerHTML = options.map((option, index) => `
          <div class="mb-2 form-check">
            <input type="checkbox" class="form-check-input" id="${name}-${index}" name="${name}[]" value="${index+1}">
            <label class="form-check-label" for="${name}-${index}">${option}</label>
          </div>
        `).join('');
    } else {
        container.innerHTML = options.map((option, index) => `
          <div class="mb-2 form-check">
            <input type="radio" class="form-check-input" id="${name}-${index}" name="${name}[]" value="${index+1}">
            <label class="form-check-label" for="${name}-${index}">${option}</label>
          </div>
        `).join('');
    }
}

async function loadCheckboxOptions() {
  try {
    console.log('Carregando opções...');
    const [estruturaData, finalidadeData, acessoData] = await Promise.all([
        fetch('http://127.0.0.1:5000/estruturas/').then(r => r.json()),
        fetch('http://127.0.0.1:5000/finalidades/').then(r => r.json()),
        fetch('http://127.0.0.1:5000/tipos-acesso/').then(r => r.json()),
    ]);

    const estrutura = estruturaData.map(item => item.name);
    const finalidade = finalidadeData.map(item => item.name);
    const acesso = acessoData.map(item => item.name);

    renderCheckboxGroup("estrutura-options", "estrutura", estrutura);
    renderCheckboxGroup("finalidade-options", "finalidade", finalidade);
    renderCheckboxGroup("acesso-options", "acesso", acesso);

    const modal2Fields = document.querySelectorAll("#estrutura-options input, #finalidade-options input, #acesso-options input");
    modal2Fields.forEach(field => {
        field.addEventListener("change", validateModal2);
    });

    validateModal2();
  } catch (err) {
      console.error("Erro ao buscar opções:", err);
  }
}

async function fetchAllParks() {
  try {
    const response = await fetch('http://127.0.0.1:5000/parques/');
    console.log(response)
    if (!response.ok) {
      throw new Error(`Erro ao buscar parques: ${response.status}`);
    }

    allParks = await response.json();
    console.log('Parques registrados:', allParks);

    if (window.parksLayer) {
      map.removeLayer(window.parksLayer);
    }

    window.parksLayer = L.layerGroup().addTo(map);

    allParks.forEach(park => {
      if (park.lat && park.long) {
        const marker = L.marker([park.lat, park.long]).addTo(window.parksLayer);

        marker.bindPopup(`
          <b>${park.name}</b><br>
          ${park.street}, ${park.city} - ${park.state}<br>
          <i>${park.access_description}</i><br>
          Estruturas: ${park.structures}<br>
          Finalidades: ${park.purposes}
        `);

        park._marker = marker;
      }
    });

    const validParks = allParks.filter(p => p.lat && p.long);
    if (validParks.length > 0) {
      const group = L.featureGroup(validParks.map(p => p._marker));
      map.fitBounds(group.getBounds());
    }

  } catch (error) {
    console.error('Erro ao buscar os parques:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAllParks();
});

async function getStateFromAPI() {
    return fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); 
        })
        .catch(error => {
          console.error("Error fetching data:", error);
          throw error;
        });
}

async function loadStateOptions() {
    const response = await getStateFromAPI();
    const container = document.getElementById("estadoSelect");
    container.innerHTML = response.map((option) => `
       <option value="${option.sigla}">${option.nome}</option>
    `).join('');
}

async function getCityFromAPI(state) {
    return fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); 
        })
        .catch(error => {
          console.error("Error fetching data:", error);
          throw error;
        });
}

async function loadCityOptions() {
    const stateContainer = document.getElementById("estadoSelect");
    const selectedState = stateContainer.options[stateContainer.selectedIndex].value
    const response = await getCityFromAPI(selectedState);
    const cityContainer = document.getElementById("cidadeSelect");
    cityContainer.innerHTML = response.map((option) => `
       <option value="${option.nome}">${option.nome}</option>
    `).join('');
}

async function getCoordenatesFromAPI(street, city, state) {
    return fetch(`https://nominatim.openstreetmap.org/search?q=${street},${city},${state}&format=json`).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); 
        })
        .catch(error => {
          console.error("Error fetching data:", error);
          throw error;
        });
}

function handleCheckbox(checkboxDiv) {
    if (!checkboxDiv) return [];

    const selectedCheckBox = checkboxDiv.querySelectorAll('input[type="checkbox"]:checked');
  
    const selectedValue = Array.from(selectedCheckBox).map(checkbox => checkbox.value);
  
    return selectedValue.map(item => parseInt(item));
}

function handleRadioButton(radioButtonDiv) {
    if (!radioButtonDiv) return [];

    const selectedRadioButton = radioButtonDiv.querySelectorAll('input[type="radio"]:checked');
  
    const selectedValue = Array.from(selectedRadioButton).map(radioButton => radioButton.value);
  
    return selectedValue.map(item => parseInt(item));
}

function plotCoordinateOnMap(coordinates) {
    const marker = L.marker(coordinates).addTo(map)
        .bindPopup('<b>Novo parque adicionado.</b><br />Clique para ver as informações.').openPopup();
}

async function sendFunction() {
    const estruturaOptions = document.querySelectorAll("#estrutura-options input[type='checkbox']:checked");
    const finalidadeOptions = document.querySelectorAll("#finalidade-options input[type='checkbox']:checked");
    const acessoOptions = document.querySelectorAll("#acesso-options input[type='radio']:checked");

    if (estruturaOptions.length === 0 || finalidadeOptions.length === 0 || acessoOptions.length === 0) {
        alert("Por favor, preencha todos os campos obrigatórios antes de salvar.");
        return;
    }
    
    const parkName = document.getElementById('parkName').value;
    const stateContainer = document.getElementById("estadoSelect");
  const selectedState = stateContainer.value;
    const cityContainer = document.getElementById("cidadeSelect");
  const selectedCity = cityContainer.value;
    const street = document.getElementById('ruaInput').value;
    const number = document.getElementById('numeroInput').value;
    const structures = handleCheckbox(document.getElementById('estrutura-options'));
    const purposes = handleCheckbox(document.getElementById('finalidade-options'));
    const access = handleRadioButton(document.getElementById('acesso-options'));

    const responseCoordinates = await getCoordenatesFromAPI(street, selectedCity, selectedState);
    if (!responseCoordinates) {
        alert("Não encontrou endereço!");
        return;  
    }

    const formDataJson = {
        "name": parkName,
        "access": access[0],
        "address": {
          "street": street,
          "city": selectedCity,
          "state": selectedState,
          "postal_code": "80000-000",
          "country": "Brasil",
          "lat": responseCoordinates[0].lat,
          "long": responseCoordinates[0].lon
        },
        "structures": structures,
        "purposes": purposes
  };

  const method = editingParkId ? 'PUT' : 'POST';
  const url = editingParkId ? `http://127.0.0.1:5000/parques/${editingParkId}` : 'http://127.0.0.1:5000/parques/';

  fetch(url, {
      method,
      headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formDataJson)
    }).then(response => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      alert(editingParkId ? "Parque atualizado com sucesso!" : "Parque registrado com sucesso!");

      // Fecha os modais
        const modal1 = bootstrap.Modal.getInstance(document.getElementById('addParkModal'));
        const modal2 = bootstrap.Modal.getInstance(document.getElementById('addParkModal2'));
        if (modal1) modal1.hide();
        if (modal2) modal2.hide();

        document.getElementById("park-form").reset();
      editingParkId = null; // reseta para próximo uso

      plotCoordinateOnMap([parseFloat(responseCoordinates[0].lat), parseFloat(responseCoordinates[0].lon)]);
      fetchAllParks(); // atualiza mapa
      listParks(); // atualiza modal
        return response.json();
  }).catch(error => console.error('Error:', error));
}

document.querySelector('button[onclick="registerPark()"]').addEventListener('click', async () => {
  editingParkId = null;
  // Limpa campos do modal 1
  document.getElementById("park-form").reset();

  // Limpa selects
  const estadoSelect = document.getElementById("estadoSelect");
  const cidadeSelect = document.getElementById("cidadeSelect");
  estadoSelect.innerHTML = "";
  cidadeSelect.innerHTML = "";

  // Carrega estados e checkboxes para modal 2
  await loadStateOptions();
  await loadCheckboxOptions();

  // Desmarca todos os checkboxes e radio buttons
  const allInputs = document.querySelectorAll("#estrutura-options input, #finalidade-options input, #acesso-options input");
  allInputs.forEach(input => input.checked = false);

  // Abre o modal 1
  const modal1El = document.getElementById('addParkModal');
  const modal1Instance = bootstrap.Modal.getInstance(modal1El) || new bootstrap.Modal(modal1El);
  modal1Instance.show();
});

function validateModal1() {
  const modal1Fields = document.querySelectorAll("#addParkModal input[required], #addParkModal select[required]");
  const nextButton = document.querySelector("#addParkModal .btn-primary");

  const allValid = Array.from(modal1Fields).every(field => field.value.trim() !== "");
  nextButton.disabled = !allValid;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal1Fields = document.querySelectorAll("#addParkModal input[required], #addParkModal select[required]");
  modal1Fields.forEach(field => {
      field.addEventListener("input", validateModal1);
      field.addEventListener("change", validateModal1);
  });

  validateModal1();
});

function validateModal2() {
  const estruturaOptions = document.querySelectorAll("#estrutura-options input[type='checkbox']:checked");
  const finalidadeOptions = document.querySelectorAll("#finalidade-options input[type='checkbox']:checked");
  const acessoOptions = document.querySelectorAll("#acesso-options input[type='radio']:checked");
  const saveButton = document.querySelector("#addParkModal2 .btn-primary");

  const allValid = estruturaOptions.length > 0 && finalidadeOptions.length > 0 && acessoOptions.length > 0;
  saveButton.disabled = !allValid;
}

document.addEventListener("DOMContentLoaded", () => {
  const modal2Fields = document.querySelectorAll("#estrutura-options input, #finalidade-options input, #acesso-options input");
  modal2Fields.forEach(field => {
      field.addEventListener("change", validateModal2);
  });

  validateModal2();
});

async function deletePark(id) {
  if (!confirm("Tem certeza que deseja excluir este parque?")) return;

  try {
    const response = await fetch(`http://127.0.0.1:5000/parques/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro ao excluir parque: ${response.status}`);
    }

    alert("Parque excluído com sucesso!");

    // Atualiza a lista de cards e os markers no mapa
    await fetchAllParks();
    listParks(); // atualiza o modal com os cards restantes

  } catch (error) {
    console.error(error);
    alert("Não foi possível excluir o parque.");
  }
}

const listParksModalEl = document.getElementById('listParksModal');
listParksModalEl.addEventListener('hidden.bs.modal', () => {
  document.body.classList.remove('modal-open');
  if (window.parksLayer) map.invalidateSize();
});

async function editPark(park) {
  // Fecha modal de listagem
  const listModalEl = document.getElementById('listParksModal');
  const listModalInstance = bootstrap.Modal.getInstance(listModalEl);
  if (listModalInstance) listModalInstance.hide();

  editingParkId = park.id;

  // Preenche modal 1 campos de texto
  document.getElementById('parkName').value = park.name;
  document.getElementById('ruaInput').value = park.street;
  document.getElementById('numeroInput').value = park.number || "";

  // Carrega estados e seleciona o estado correto
  await loadStateOptions();
  const estadoSelect = document.getElementById("estadoSelect");
  estadoSelect.value = park.state;

  // Carrega cidades do estado selecionado e seleciona a cidade correta
  await loadCityOptions();
  const cidadeSelect = document.getElementById("cidadeSelect");
  cidadeSelect.value = park.city;

  // Carrega opções do modal 2 (checkboxes e radios)
  await loadCheckboxOptions();

  // Marca checkboxes de estruturas
  const estruturaOptions = document.querySelectorAll("#estrutura-options input");
  estruturaOptions.forEach(input => {
      input.checked = park.structures?.includes(parseInt(input.value)) || false;
  });

  // Marca checkboxes de finalidades
  const finalidadeOptions = document.querySelectorAll("#finalidade-options input");
  finalidadeOptions.forEach(input => {
      input.checked = park.purposes?.includes(parseInt(input.value)) || false;
  });

  // Marca radio do tipo de acesso
  const acessoOptions = document.querySelectorAll("#acesso-options input");
  acessoOptions.forEach(input => {
      input.checked = parseInt(input.value) === park.access;
  });

  validateModal1();
  validateModal2();

  // Abre o modal 1
  const modal1El = document.getElementById('addParkModal');
  const modal1Instance = bootstrap.Modal.getInstance(modal1El) || new bootstrap.Modal(modal1El);
  modal1Instance.show();
}
