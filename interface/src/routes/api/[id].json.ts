import type { RequestHandler } from '@sveltejs/kit';
import type { Locals } from '$lib/types';

const readFile = (filePath) => fs.readFileSync(fullPath(filePath), 'utf8');
const writeFile = (filePath, content) => fs.writeFileSync(fullPath(filePath), content);

// Post /api/:id.json
export const post: RequestHandler<Locals, FormData> = async (request) => {
    console.log(request.params.id);
    console.log(request.body);
    return {
        status: 200,
        body: 'go home'
    }

    
	// return api(request, `todos/${request.locals.userid}/${request.params.uid}`, {
	// 	text: request.body.get('text'),
	// 	done: request.body.has('done') ? !!request.body.get('done') : undefined
	// });
};

