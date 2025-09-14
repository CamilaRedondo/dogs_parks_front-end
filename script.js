// ---------------------------------------------------------------------------------------------------------------------------------------
let allParks = [];
let currentPage = 1;
const itemsPerPage = 2;

// === Mapa ===
const map = L.map('map').setView([51.505, -0.09], 13);

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// const marker = L.marker([51.5, -0.09]).addTo(map)
//   .bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();

// const circle = L.circle([51.508, -0.11], {
//   color: 'red',
//   fillColor: '#f03',
//   fillOpacity: 0.5,
//   radius: 500
// }).addTo(map).bindPopup('I am a circle.');

// const polygon = L.polygon([
//   [51.509, -0.08],
//   [51.503, -0.06],
//   [51.51, -0.047]
// ]).addTo(map).bindPopup('I am a polygon.');

// const popup = L.popup()
//   .setLatLng([51.513, -0.09])
//   .setContent('I am a standalone popup.')
//   .openOn(map);

// function onMapClick(e) {
//   popup
//     .setLatLng(e.latlng)
//     .setContent(`Você clicou no mapa em ${e.latlng.toString()}`)
//     .openOn(map);
// }

// map.on('click', onMapClick);

// ---------------------------------------------------------------------------------------------------------------------------------------

// === Botões do menu ===
async function registerPark() {
    console.log("Abrindo modal para registrar parque");
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
      editPark(park.id);
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

// === Renderizar checkboxes ===
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

// === Carregar opções dos checkboxes da API ===
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

    // Adiciona os eventos de validação após o carregamento dinâmico
    const modal2Fields = document.querySelectorAll("#estrutura-options input, #finalidade-options input, #acesso-options input");
    modal2Fields.forEach(field => {
        field.addEventListener("change", validateModal2);
    });

    validateModal2(); // Inicializa a validação após o carregamento
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

// == 
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

// == 
async function loadCityOptions() {
    const stateContainer = document.getElementById("estadoSelect");
    const selectedState = stateContainer.options[stateContainer.selectedIndex].value
    const response = await getCityFromAPI(selectedState);
    const cityContainer = document.getElementById("cidadeSelect");
    cityContainer.innerHTML = response.map((option) => `
       <option value="${option.nome}">${option.nome}</option>
    `).join('');
}

// == Geocodificação do endereço
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
        .bindPopup('<b>Hello world!</b><br />I am a popup.').openPopup();
}

async function sendFunction() {
    const estruturaOptions = document.querySelectorAll("#estrutura-options input[type='checkbox']:checked");
    const finalidadeOptions = document.querySelectorAll("#finalidade-options input[type='checkbox']:checked");
    const acessoOptions = document.querySelectorAll("#acesso-options input[type='radio']:checked");

    if (estruturaOptions.length === 0 || finalidadeOptions.length === 0 || acessoOptions.length === 0) {
        alert("Por favor, preencha todos os campos obrigatórios antes de salvar.");
        return;
    }

    //Recuperar as informações do formulário
    
    const parkName = document.getElementById('parkName').value;

    const stateContainer = document.getElementById("estadoSelect");
    const selectedState = stateContainer.options[stateContainer.selectedIndex].value
    
    const cityContainer = document.getElementById("cidadeSelect");
    const selectedCity = cityContainer.options[cityContainer.selectedIndex].value
    
    const street = document.getElementById('ruaInput').value;
    const number = document.getElementById('numeroInput').value;
    const structures = handleCheckbox(document.getElementById('estrutura-options'));
    const purposes = handleCheckbox(document.getElementById('finalidade-options'));
    const access = handleRadioButton(document.getElementById('acesso-options'));
    
    //Se tudo estiver correto, vamos executar a função que busca as coordenadas com base no endereço:

    const responseCoordinates = await getCoordenatesFromAPI(street, selectedCity, selectedState);
    if (!responseCoordinates) {
        alert("Não encontrou endereço!");
        return;  
    }

    // Montagem do objeto da requisição
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
    }

    // Enviando dados para o servidor
    fetch("http://127.0.0.1:5000/parques/",  {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(formDataJson)
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        alert("Parque registrado com sucesso!");

        // Fechar os modais abertos
        const modal1 = bootstrap.Modal.getInstance(document.getElementById('addParkModal'));
        const modal2 = bootstrap.Modal.getInstance(document.getElementById('addParkModal2'));
        if (modal1) modal1.hide();
        if (modal2) modal2.hide();

        // Resetar o formulário
        document.getElementById("park-form").reset();

        //Plot do ponto!
        plotCoordinateOnMap([parseFloat(responseCoordinates[0].lat), parseFloat(responseCoordinates[0].lon)])
        return response.json();
    })
    .then(responseData => {
        console.log('Success:', responseData); // Handle the successful response
    })
    .catch(error => {
        console.error('Error:', error); // Handle any errors during the request
    });
}

// // === Envio do formulário ===
// document.addEventListener("DOMContentLoaded", () => {
//   // Captura do formulário completo dos dois modais
//   const form = document.getElementById("park-form");

//   form.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const formData = new FormData(form);

//     const dados = {};
//     for (let [key, value] of formData.entries()) {
//       if (key.endsWith("[]")) {
//         const realKey = key.slice(0, -2);
//         if (!dados[realKey]) dados[realKey] = [];
//         dados[realKey].push(value);
//       } else {
//         dados[key] = value;
//       }
//     }

//     console.log("Dados do formulário:", dados);
//     console.log(getCoordenatesFromAPI(dados.rua, dados.city, dados.state));

//     const data = handleForm(dados)

//     fetch("http://127.0.0.1:5000/parques/",  {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json' 
//         },
//         body: JSON.stringify(data)
//     }).then(response => {
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         alert("Parque registrado com sucesso!");
//         return response.json();
//     })
//     .then(responseData => {
//         console.log('Success:', responseData); // Handle the successful response
//     })
//     .catch(error => {
//         console.error('Error:', error); // Handle any errors during the request
//     });
//     const modal = bootstrap.Modal.getInstance(document.getElementById('addParkModal2'));
//     modal.hide();
//     form.reset();
//   });
// });

function validateModal1() {
  const modal1Fields = document.querySelectorAll("#addParkModal input[required], #addParkModal select[required]");
  const nextButton = document.querySelector("#addParkModal .btn-primary");

  const allValid = Array.from(modal1Fields).every(field => field.value.trim() !== "");
  nextButton.disabled = !allValid;
}

// Adiciona os eventos de validação ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const modal1Fields = document.querySelectorAll("#addParkModal input[required], #addParkModal select[required]");
  modal1Fields.forEach(field => {
      field.addEventListener("input", validateModal1);
      field.addEventListener("change", validateModal1);
  });

  validateModal1(); // Inicializa a validação
});

function validateModal2() {
  const estruturaOptions = document.querySelectorAll("#estrutura-options input[type='checkbox']:checked");
  const finalidadeOptions = document.querySelectorAll("#finalidade-options input[type='checkbox']:checked");
  const acessoOptions = document.querySelectorAll("#acesso-options input[type='radio']:checked");
  const saveButton = document.querySelector("#addParkModal2 .btn-primary");

  // Verifica se pelo menos uma opção foi selecionada em cada grupo
  const allValid = estruturaOptions.length > 0 && finalidadeOptions.length > 0 && acessoOptions.length > 0;
  saveButton.disabled = !allValid;
}

// Adiciona os eventos de validação ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  const modal2Fields = document.querySelectorAll("#estrutura-options input, #finalidade-options input, #acesso-options input");
  modal2Fields.forEach(field => {
      field.addEventListener("change", validateModal2);
  });

  validateModal2(); // Inicializa a validação ao carregar a página
});