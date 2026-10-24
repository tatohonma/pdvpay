// O voltar do Android fica desativado no app inteiro (ver MainActivity). As janelas
// (Modal) recebem o voltar por conta própria via onRequestClose, então usam esta
// função para ignorá-lo também: só fecham pelos próprios botões.
export const ignoreHardwareBack = () => {};
