import type { RequestHandler } from '@sveltejs/kit';
import type { Locals } from '$lib/types';
import * as fs from 'fs';
// import * as path from 'path';
import path from 'path';
const __dirname = path.resolve();

const projectRoot = path.join(__dirname, 'src/lib/compendium');

const fullPath = (filePath) => path.join(projectRoot, filePath);

const readFile = (filePath) => fs.readFileSync(fullPath(filePath), 'utf8');
const writeFile = (filePath, content) => fs.writeFileSync(fullPath(filePath), content);

export const get: RequestHandler<Locals, string> = (request) => {
    let body = '';
    const file = request.query.get('file');
    if (file) {
        body = readFile(file);
    }
    return {
        status: 200,
        headers: {
            'content-type': 'appliction/json'
        },
        body
    }
}

export const post: RequestHandler<Locals, string> = async (request) => {
    const update = JSON.parse(request.body);
    const fileName = update.file;
    delete update.file;
    const file = readFile(fileName);
    const json = JSON.parse(file);
    
    // new files, some entfernen
    if (json.entries[update.id]) {
        json.entries[update.id] = {
            name: update.name,
            description: update.description,
            material: update.material,
            source: update.source,
        };
        writeFile(fileName, JSON.stringify(json));  
    }  
    return {
        status: 200,
        body: 'go home'
    }

    
	// return api(request, `todos/${request.locals.userid}/${request.params.uid}`, {
	// 	text: request.body.get('text'),
	// 	done: request.body.has('done') ? !!request.body.get('done') : undefined
	// });
};

