/**
 * Google Apps Script Bridge per NoteHub
 * 
 * Istruzioni di setup:
 * 1. Apri script.google.com
 * 2. Crea nuovo progetto
 * 3. Incolla questo codice
 * 4. Modifica la variabile FOLDER_ID con l'ID della cartella Drive
 * 5. Modifica la variabile SECRET con un segreto sicuro
 * 6. Deploy > New Deployment
 * 7. Seleziona Web app
 * 8. Execute as: Me
 * 9. Who has access: Anyone
 * 10. Copia l'URL del web app
 */

const FOLDER_ID = 'LA_TUA_CARTELLA_ID_QUI';
const SECRET = 'il_tuo_segreto_sicuro_qui';

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  const params = e.parameter || {};
  const postData = e.postData ? e.postData.contents : null;
  
  let payload = {};
  
  if (postData) {
    try {
      payload = JSON.parse(postData);
    } catch (err) {
      return jsonResponse({ success: false, error: 'Invalid JSON' });
    }
  }
  
  const secret = params.secret || payload.secret;
  
  if (secret !== SECRET) {
    return jsonResponse({ success: false, error: 'Invalid secret' });
  }
  
  const action = params.action || payload.action;
  
  if (action === 'upload') {
    return handleUpload(payload);
  } else if (action === 'list') {
    return handleList();
  }
  
  return jsonResponse({ success: false, error: 'Unknown action' });
}

function handleUpload(payload) {
  const filename = payload.filename;
  const mimeType = payload.mimeType;
  const dataBase64 = payload.dataBase64;
  
  if (!filename || !dataBase64) {
    return jsonResponse({ success: false, error: 'Missing filename or data' });
  }
  
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    
    const decodedData = Utilities.base64Decode(dataBase64);
    const blob = Utilities.newBlob(decodedData, mimeType, filename);
    
    const file = folder.createFile(blob);
    
    const fileId = file.getId();
    const viewUrl = file.getUrl();
    const downloadUrl = 'https://drive.google.com/uc?id=' + fileId + '&export=download';
    
    return jsonResponse({
      success: true,
      fileId: fileId,
      viewUrl: viewUrl,
      downloadUrl: downloadUrl
    });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function handleList() {
  try {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const files = folder.getFiles();
    
    const fileList = [];
    
    while (files.hasNext()) {
      const file = files.next();
      
      fileList.push({
        id: file.getId(),
        name: file.getName(),
        mimeType: file.getMimeType(),
        size: file.getSize(),
        createdTime: file.getDateCreated().toISOString(),
        webViewLink: file.getUrl(),
        webContentLink: file.getDownloadUrl(),
        iconLink: file.getIconUrl()
      });
    }
    
    return jsonResponse({
      success: true,
      files: fileList
    });
    
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}