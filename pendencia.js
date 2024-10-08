// Inicializando o Parse SDK com as chaves do Back4App
Parse.initialize("iqopHCeFYry124HyoTvxZElq0vMLvcF89vRObJT6", "DEJVnFH8wWwuXaubQ3fukg6c1jL5Fhz0ToHMfh4m"); // Substitua pelas suas chaves
Parse.serverURL = 'https://parseapi.back4app.com/';

document.getElementById('pendenciaForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o envio padrão do formulário

    const nf = document.getElementById('nfInput').value;
    const observacoes = document.getElementById('observacoesInput').value;
    const tipo = document.getElementById('tipoInput').value;

    // Validação básica
    if (nf && observacoes && tipo) {
        // Criando uma nova instância da classe Pendencias no Parse
        const Pendencia = Parse.Object.extend("Pendencias");
        const pendencia = new Pendencia();

        // Adicionando os dados ao objeto pendencia
        pendencia.set("nf", nf);
        pendencia.set("observacoes", observacoes);
        pendencia.set("tipo", tipo);

        // Salvando a pendência no Back4App
        pendencia.save()
        .then((result) => {
            alert('Pendência salva com sucesso!\nID: ' + result.id);
            // Limpa o formulário após o sucesso
            document.getElementById('pendenciaForm').reset();
        })
        .catch((error) => {
            alert('Falha ao salvar pendência: ' + error.message);
        });
    } else {
        alert('Por favor, preencha todos os campos.');
    }
});
