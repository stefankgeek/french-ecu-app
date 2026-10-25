/**
 * Enregistrer un fichier généré sur l'appareil : partage natif sur téléphone
 * (Enregistrer dans Fichiers, Drive, e-mail…) sinon téléchargement classique.
 */
export async function saveFile(blob, fileName) {
  const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: fileName }); return 'shared'; } catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
  }
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: fileName });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return 'downloaded';
}
