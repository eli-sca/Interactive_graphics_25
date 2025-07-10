// Scandiuzzi Elisa 2069444

class Loader{
    // Load OBJ from files

    async loadOBJ(obj) {
        // Load multiple files OBJ given array of names of obj, url of the type ./objs/name.obj
        if (DEBUG){console.log(`Start ${obj}.obj loading`);}
        let url = './objs/'+obj+'.obj';
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Error loading OBJ file: ${obj}`);
            }
            const text =  await response.text();
            if (DEBUG){console.log(`${obj}.obj correctly loaded`);}
            return text
        } catch (error) {
            console.error(`Error loading ${obj}:`, error);
        }
    }

    async loadMultipleOBJs(objs) {
        // Load multiple files OBJ given array of names of obj, url of the type ./objs/name.obj
        let meshes = [];
        for (var obj of objs) {
            const txt_obj = await this.loadOBJ(obj)
            meshes.push(txt_obj);  
        }
        return meshes
    }

    async loadjson(level_name){
        try {
            let response = await fetch('../levels.json')
            const data = await response.json();
            return data;
        }
        catch (error) {
            console.error(`Error loading json:`, error);
        }
    }

    async loadLevelBackgroundOBJs(oggetti){
        let meshes = [];
        try {
            // let response = await fetch('../levels.json')
            // const data = await response.json()
            
            // // Accesso ai dati del livello selezionato
            // const livelloSelezionato = level_name; 
            // skyboxLocation = data.levels[livelloSelezionato].skybox;
            // const oggetti = data.levels[livelloSelezionato].bckground_objs;

            for (const obj of oggetti) {
                if (DEBUG){console.log(`Start ${obj.name} loading`);
                    console.log('Nome:', obj.name);
                    console.log('File OBJ:', obj.file_obj);
                    console.log('Texture:', obj.texture);
                    console.log('Posizione:', obj.posizione);
                    console.log('Rotazione:', obj.rotazione);
                    console.log('Scaling:', obj.scaling);}

                const txt_obj = await this.loadOBJ(obj.file_obj);
                const texture_obj = await this.loadtexture(obj.texture);
                let bck_obj = new Mesh( txt_obj, obj.name, obj.scaling, new Vector3([obj.posizione.x, obj.posizione.y, obj.posizione.z]), obj.rotazione.x, obj.rotazione.y, obj.rotazione.z, texture_obj, true)
                meshes.push( bck_obj );
                
            };
            return meshes;
        } catch (error) {
            console.error(`Error loading mesh:`, error);
        }

    }


    async loadtexture(url) {
        // Load texture as Image
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Errore nel caricare ${url}`));
            img.src = './objs/' + url;
        });
    }
}
