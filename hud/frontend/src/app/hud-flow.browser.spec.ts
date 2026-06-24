import { describe, it, expect } from 'vitest';

describe('HUD Browser Flow Integration', () => {
  it('should render the Glances interface', async () => {
    // Cria um iframe apontando para a aplicação local do Glances HUD via proxy
    const iframe = document.createElement('iframe');
    iframe.src = '/hud/';
    iframe.style.width = '1280px';
    iframe.style.height = '800px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    // Espera o carregamento do iframe
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
    });

    // Aguarda a inicialização do app Angular e conexão com o SSE mock
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    expect(iframeDoc).toBeTruthy();

    const bodyHtml = iframeDoc?.body.innerHTML || '';
    
    // Verifica se a estrutura básica da HUD ou tela de login foi carregada no browser
    expect(bodyHtml.toLowerCase()).toContain('glances');
    
    // Limpeza
    document.body.removeChild(iframe);
  });
});
