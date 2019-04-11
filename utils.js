// Function to return the strikethrough version
// of a giver string.
function strikeThrough(text) {
    return text.split('').map(char => char + '\u0336').join('')
}

function getHelpMessage() {
    return "Olá! Sou o Amigo Oculto Bot e vou ajudá-los a fazer um amigo oculto!\n" +
    "Para começar a usar, basta digitar\n" + 
    "/menu e utilizar os botões.\n\n" +
    "Além disso, os seguintes comandos estão disponíveis:\n" + 
    "/criar -> Cria um novo Amigo Oculto.\n" + 
    "/deletar -> Deleta o Amigo Oculto.\n" + 
    "/entrar -> Entra no Amigo Oculto.\n" +
    "/sair -> Sair do Amigo Oculto.\n" + 
    "/sortear -> Sorteia o Amigo Oculto.\n" + 
    "/ajuda -> Exibe esta mensagem."

    // "Criado por [Fabiana Ferreira](tg://user?id=173433762) e [Lucas Cerqueira](tg://user?id=146544127)."
}

module.exports = {
    strikeThrough,
    getHelpMessage
}