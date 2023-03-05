import logo from './assets/logo.png'

function App() {

  return (<>
    <div className="container">
      <div>
        <div className='d-flex flex-column justify-content-center align-items-center mb-3'>
          <img src={logo}></img>
          <h3>XmlParser per xTranslator</h3>
        </div>
        <div className='d-flex flex-column justify-content-between mb-3'>
          <button className='btn mb-2' data-bs-toggle="modal" data-bs-target="#Modal1">Converti Xml in Ini</button>
          <button className='btn' data-bs-toggle="modal" data-bs-target="#Modal2">Aggiorna Xml Tradotto</button>
        </div>
      </div>

    </div>

    <div className="modal fade" id="Modal1" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <form className="needs-validation" noValidate>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">Converti XML in Ini</h1>
            <button id="Modal1Close" type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className='form-label'>Inserisci il file xml</label>
              <input type="file" className="btn form-control" id="inputGroupFile01" accept=".xml" required/>
              <div className="invalid-feedback">
                Inserisci il file correto, in formato xml ed estratto da xTranslator, per continuare
              </div>
            </div>
          </div>
          <div className="modal-footer d-flex justify-content-center">
            <button type="submit" className="btn" onClick={(e)=>{
              e.preventDefault();

              const input= document.getElementById("inputGroupFile01");
              const [file] = input.files
              let path=""
              if (file) {
                path=file.path
              }
              console.log(path)
              window.electron.ipcRenderer.invoke("api:readFile",path)
              .then((data)=>{
                console.log(data)
                console.log("Inizio lettura di stringhe...")
                let inistrings=""
                let xmlstrings=""
                const strings= data.split("<String ")
                xmlstrings+=strings[0]
                console.log("Numero di stringhe da acquisire: "+(strings.length-1))
                for(let i=1; i<strings.length; i++)
                {
                  let string= strings[i];
                  let edid, rec, source, dest;
                  edid= string.substring(string.indexOf(">",string.indexOf("<EDID"))+1,string.indexOf("</EDID>"));
                  rec= string.substring(string.indexOf(">",string.indexOf("<REC"))+1,string.indexOf("</REC>"));
                  source= string.substring(string.indexOf(">",string.indexOf("<Source"))+1,string.indexOf("</Source>")).replaceAll(/(?:\r\n|\r|\n)/g,"\\n");
                  dest= string.substring(string.indexOf(">",string.indexOf("<Dest"))+1,string.indexOf("</Dest>")).replaceAll(/(?:\r\n|\r|\n)/g,"\\n");
                  let occurrencies=1;
                  for(let j=1;j<i;j++)
                  {
                    let string2= strings[j];
                    let edid2= string2.substring(string2.indexOf(">",string2.indexOf("<EDID"))+1,string2.indexOf("</EDID>"));
                    if(edid===edid2)
                      occurrencies++;
                  }
                  let newedid=edid+"/"+occurrencies;
                  inistrings+=newedid+"=\""+source+"\"\n";
                  console.log(string)
                  string=string.replace(edid,newedid)
                  console.log(string)
                  string="<String "+string
                  console.log(string)
                  xmlstrings+=string;
                  console.log("Nuova stringa acquisita: "+newedid+","+source)
                }
                console.log("Fine lettura di stringhe.")
                const outpath=file.path.replace(".xml",".ini")
                console.log("Inizio scrittura file ini...")
                window.electron.ipcRenderer.invoke("api:createFile",outpath,inistrings)
                .then((data)=>{
                  console.log("Fine scrittura file ini.")
                  const img= document.createElement("img");
                  img.src="./src/assets/done.png"
                  img.width="32"
                  img.height="32"
                  e.target.innerText=""
                  e.target.appendChild(img)
                  const closeButton= document.getElementById("Modal1Close");
                  closeButton.click()
                  Array.from(document.getElementsByTagName("form")).forEach((form)=>{
                    form.reset();
                  });
                  const button= document.querySelector("[type=\"submit\"]")
                  button.removeChild(img)
                  button.innerText="Scarica Ini"
                })
                .catch((err)=>{
                })
                console.log("Inizio scrittura file xml...")
                window.electron.ipcRenderer.invoke("api:createFile",file.path,xmlstrings)
                .then((data)=>{
                })
                .catch((err)=>{})
                console.log("Fine scrittura file xml.")

              })
              .catch((err)=>{
                console.log(err);
              })
              
            }}>Scarica Ini</button>
          </div>
        </div>
      </div>
      </form>
    </div>

    <div className="modal fade" id="Modal2" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
      <form className="needs-validation" noValidate>    
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">Aggiorna Xml Tradotto</h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body w-100">
            <div className="input-group w-100 d-flex flex-column mb-3">
            <div className='mb-4'>
                <label className='form-label text-dark' htmlFor='inputGroupFile2'>Inserisci il file xml originale:</label>
                <input type="file" className="btn w-100  form-control" id="inputGroupFile02" accept='.xml' required/>
                <div className="invalid-feedback">

                </div>
              </div>
              <div className='mb-2'>
                <label className='form-label text-dark' htmlFor='inputGroupFile3'>Inserisci il file ini scaricato da Transifex o in cui hai effettuato le traduzioni:</label>
                <input type="file" className="btn w-100 form-control" id="inputGroupFile03" accept='.ini' required/>
                <div className="invalid-feedback">
                  Inserisci il file correto, in formato joomla ini scaricato da Transifex, per continuare
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer d-flex justify-content-center">
            <button type="submit" className="btn" onClick={(e)=>{
              e.preventDefault();
              const inputxml= document.getElementById("inputGroupFile02");
              let [file1] = inputxml.files
              var path=""
              if (file1) {
                path=file1.path
              }
              window.electron.ipcRenderer.invoke("api:readFile",file1.path)
              .then((xmldata)=>{
                const inputini= document.getElementById("inputGroupFile03");
                let [file2] = inputini.files
                var path=""
                if (file2) {
                  path=file2.path
                }
                window.electron.ipcRenderer.invoke("api:readFile",file2.path)
                .then((inidata)=>{
                  let result=[];
                  let xmlstrings=xmldata.split("<String ");
                  result.push(xmlstrings.splice(0,1));
                  let inistrings=inidata.split("\n");
                  inistrings.splice(-1,1);
                  let newedid, edid, rec, source, dest;
                  xmlstrings.map((xmlstring,i)=>{
                    newedid= xmlstring.substring(xmlstring.indexOf(">",xmlstring.indexOf("<EDID"))+1,xmlstring.indexOf("</EDID>"));
                    edid=newedid.replace(newedid.substring(newedid.indexOf("/"),newedid.length),"");
                    rec= xmlstring.substring(xmlstring.indexOf(">",xmlstring.indexOf("<REC"))+1,xmlstring.indexOf("</REC>"));
                    source= xmlstring.substring(xmlstring.indexOf(">",xmlstring.indexOf("<Source"))+1,xmlstring.indexOf("</Source>")).replaceAll(/(?:\r\n|\r|\n)/g,"\\n");
                    dest= xmlstring.substring(xmlstring.indexOf(">",xmlstring.indexOf("<Dest"))+1,xmlstring.indexOf("</Dest>")).replaceAll(/(?:\r\n|\r|\n)/g,"\\n");
                    result.push(xmlstrings[i].replace(newedid,edid))
                    const fields=inistrings[i].split("=\"")
                    let value=fields[1].replace("\"","").replaceAll("\\n","\r\n")
                    result[i+1]=[result[i+1].slice(0,result[i+1].indexOf("<Dest>")+6),value,result[i+1].slice(result[i+1].indexOf("</Dest>"),result[i+1].length)].join("")
                  })
                  let resultarray=Array.from(result)
                  console.log("result array: ",resultarray)
                  let xmltradotto=(resultarray.join("<String "))
                  window.electron.ipcRenderer.invoke("api:createFile",file1.path.replace(".xml","_tradotto.xml"),xmltradotto)
                  .then((callbackresult)=>{
                    console.log("File created")
                  })
                  .catch((err)=>{console.log(err)})
                })
                .catch((err)=>{console.log(err)})
              })
              .catch((err)=>{console.log(err)})

            }}>Scarica Xml Aggiornato</button>
          </div>
        </div>
      </div>
      </form>
    </div>
    </>)
}

export default App