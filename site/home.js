// Link para os PDFs
const botoesPdf = document.querySelectorAll('.link-btn');

botoesPdf.forEach(function(botao) {
  botao.addEventListener('click', function() {
    const caminhoPdf = this.dataset.pdfSrc;

    // Aqui ele abre uma nova guia no navegador em que vc já está
    window.open(caminhoPdf, '_blank');
  });
});