import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { writeFile, readFile } from 'fs'

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    },
    icon: icon
  })

  function openFile(finalpath){
    return new Promise((resolve,reject)=>{
      readFile(finalpath,{encoding: 'utf-8'},(err,data)=>{
        if(!err)
          resolve(data);
        else
          reject(err);
      });
    })
  }

  ipcMain.handle("api:appendFile",async (event,paths)=>{
    console.log("Invoked append file with paths:\n"+paths.join("\n"))
    let data=[]
    for(let i=0; i<paths.length; i++)
    {
      const newlines=await openFile(paths[i])
      .then(content=>{
        let resultlines=[];
        const lines=content.split("\n");
        for(let j=0;j<lines.length;j++)
        {
          if(j!=lines.length-1){
            let parts=lines[j].split(",")
            let occurrencies=0;
            for(let z=0;z<data.length;z++)
            {
              let existingparts=data[z].split(",")
              if(existingparts.includes(parts[0]))
              {
                occurrencies++;
              }
            }
            if(occurrencies>0)
              parts[0]=parts[0]+"("+occurrencies+")"
            lines[j]=parts.join(",")  
          }
          resultlines.push(lines[j])
        }
        if(resultlines.length>0)
          return resultlines;
      })
      .catch(err=>console.log(err))
      console.log("File "+paths[i]+" produced newlines:\n"+newlines)
      if(newlines)
        newlines.forEach(line=>data.push(line))
    }
    const outpath= paths[0].replace(paths[0].substring(paths[0].lastIndexOf("\\")),"\\glossario.csv");
    const finaldata= data.filter(line=>{
      if(line!="\n")return line;
    }).join("\n");
    writeFile(outpath,finaldata,function(err){
      if(err){
        console.log(err);
        return;
      }
      console.log("Created file at "+outpath+" with content:\n"+finaldata);
    })
  })

  ipcMain.handle("api:createFile",(event, path, content)=>{
    writeFile(path,content,function(err,result){
      if(err)
        return;
      console.log("Created file at "+path)
      return result;
    });
    return;
  })



  ipcMain.handle("api:readFile",async (event, path)=>{
    console.log("Invoked read file with path: "+path)
    return await openFile(path)
    .then(data=>data)
    .catch(err=>err)    
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
