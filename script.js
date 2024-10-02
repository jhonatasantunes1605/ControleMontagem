const TechnicianManager = (() => {
    Parse.initialize("iqopHCeFYry124HyoTvxZElq0vMLvcF89vRObJT6", "DEJVnFH8wWwuXaubQ3fukg6c1jL5Fhz0ToHMfh4m"); // Substitua com suas credenciais
    Parse.serverURL = "https://parseapi.back4app.com/";

    let technicians = [];
    let selectedTechnician = null;
    let currentIndex = 0;

    const infractions = [
        { label: 'Seguiu padronização dos setores', pointsLost: 2 },
        { label: 'Esqueceu peças', pointsLost: 3 },
        { label: 'Montagem incorreta', pointsLost: 5 },
        { label: 'Manuseio inadequado', pointsLost: 4 }
    ];

    const Technician = Parse.Object.extend('Technician');

    const initialize = async () => {
        await loadTechnicians(); // Carrega os técnicos ao inicializar
        initializeTechnicianList(); // Inicializa a lista de técnicos
        populateInfractionSelect(); // Preenche as opções de infrações
        document.getElementById('infraction').addEventListener('change', handleInfractionSelect);
    };

    const loadTechnicians = async () => {
        const query = new Parse.Query(Technician);
        try {
            const results = await query.find();
            technicians = results.map(tech => ({
                id: tech.id,
                name: tech.get('name'),
                bench: tech.get('bench'),
                points: tech.get('points'),
                faults: tech.get('faults') || [], // Garantir que sempre seja um array
                photo: tech.get('photo') || 'https://cdn-icons-png.flaticon.com/512/1028/1028931.png' // Foto padrão se não houver
            }));
        } catch (error) {
            console.error('Erro ao buscar técnicos:', error);
        }
    };

    const initializeTechnicianList = () => {
    const technicianList = document.getElementById('technician-list');
    technicianList.innerHTML = '';

    technicians.forEach((tech, index) => {
        const li = document.createElement('li');

        // Define a cor dos pontos com base no valor
        let pointsClass = 'green';
        if (tech.points >= 4 && tech.points <= 7) {
            pointsClass = 'yellow';
        } else if (tech.points <= 3) {
            pointsClass = 'red';
        }

        li.innerHTML = `
            <img src="${tech.photo}" alt="Foto de ${tech.name}">
            <div class="technician-info">
                <span>${tech.name}</span>
            </div>
            <div class="technician-points ${pointsClass}">
                ${tech.points}
            </div>
        `;

        // Adiciona o evento de clique para selecionar o técnico
        li.onclick = () => selectTechnician(index);

        technicianList.appendChild(li);
    });
};


    const populateInfractionSelect = () => {
        const infractionSelect = document.getElementById('infraction');
        infractionSelect.innerHTML = '<option value="">Selecione uma infração</option>'; // Resetar opções
        infractions.forEach((infraction, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${infraction.label} (-${infraction.pointsLost} pontos)`;
            infractionSelect.appendChild(option);
        });
    };

    const selectTechnician = (index) => {
        selectedTechnician = technicians[index];
        currentIndex = index;
        document.getElementById('technician-list').style.display = 'none';
        document.getElementById('technician-info').style.display = 'block';
        updateTechnicianInfo();
    };

    const updateTechnicianInfo = () => {
        document.getElementById('technicianName').textContent = selectedTechnician.name;
        document.getElementById('technicianBench').textContent = selectedTechnician.bench;
        document.getElementById('technicianPoints').textContent = selectedTechnician.points;
        document.getElementById('technicianPhoto').src = selectedTechnician.photo;

        const infractionList = document.getElementById('infractionList');
        infractionList.innerHTML = '';
        const infractionCount = {};

        selectedTechnician.faults.forEach(fault => {
            const dateKey = new Date(fault.date).toDateString(); // Agrupa por data
            const key = `${fault.label} (${dateKey})`;

            if (!infractionCount[key]) {
                infractionCount[key] = 0;
            }

            infractionCount[key]++;

            const countSuffix = infractionCount[key] > 1 ? ` X${infractionCount[key]}` : '';
            const li = document.createElement('li');
            li.textContent = `${fault.label} (-${fault.pointsLost} pontos) [${fault.date}]${countSuffix}`;
            infractionList.appendChild(li);
        });
    };

    const addInfraction = async () => {
        const infractionSelect = document.getElementById('infraction');
        const selectedValue = infractionSelect.value;
        const selectedInfraction = infractions[selectedValue];

        if (selectedTechnician && selectedInfraction) {
            const now = new Date();
            selectedTechnician.faults.push({
                label: selectedInfraction.label,
                pointsLost: selectedInfraction.pointsLost,
                date: now.toLocaleString()
            });
            selectedTechnician.points -= selectedInfraction.pointsLost;
            updateTechnicianInfo();
            initializeTechnicianList(); // Atualiza a lista de técnicos

            // Salvar no Parse
            const technician = new Parse.Query(Technician);
            technician.get(selectedTechnician.id).then((tech) => {
                tech.set('points', selectedTechnician.points);
                tech.set('faults', selectedTechnician.faults);
                return tech.save();
            }).then(() => {
                alert('Infração adicionada com sucesso!');
            }).catch((error) => {
                console.error('Erro ao salvar técnico:', error);
            });
        }
    };

    const addTechnician = async () => {
    const name = sanitize(prompt("Nome do Técnico:"));
    if (!name) {
        alert('O nome do técnico é obrigatório.');
        return;
    }
    const bench = sanitize(prompt("Banca do Técnico:"));
    if (!bench) {
        alert('A banca do técnico é obrigatória.');
        return;
    }
    const photo = prompt("URL da foto do Técnico (opcional):") || 'https://cdn-icons-png.flaticon.com/512/1028/1028931.png';

    const newTechnician = {
        name: name,
        bench: bench,
        points: 10,
        faults: [],
        photo: photo // Usa o URL fornecido ou a foto padrão
    };
    technicians.push(newTechnician);
    initializeTechnicianList();

    // Salvar no Parse
    const technician = new Technician();
    technician.set('name', name);
    technician.set('bench', bench);
    technician.set('points', 10);
    technician.set('faults', []);
    technician.set('photo', photo);

    try {
        await technician.save();
        alert('Técnico adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar técnico:', error);
    }
};

    const backToList = () => {
        document.getElementById('technician-info').style.display = 'none';
        document.getElementById('technician-list').style.display = 'block';
    };

    const toggleInfractions = () => {
        const infractionList = document.getElementById('infractionList');
        const toggleIndicator = document.getElementById('toggleIndicator');
        if (infractionList.style.display === 'none') {
            infractionList.style.display = 'block';
            toggleIndicator.textContent = '[-]';
        } else {
            infractionList.style.display = 'none';
            toggleIndicator.textContent = '[+]';
        }
    };

    const handleInfractionSelect = () => {
        const infractionSelect = document.getElementById('infraction');
        const addInfractionButton = infractionSelect.nextElementSibling;
        addInfractionButton.disabled = infractionSelect.value === '';
    };

    const sanitize = (input) => {
        const tempDiv = document.createElement('div');
        tempDiv.textContent = input;
        return tempDiv.innerHTML;
    };

    return {
        addTechnician,
        addInfraction,
        toggleInfractions,
        backToList,
        initialize
    };
})();

window.onload = TechnicianManager.initialize;
