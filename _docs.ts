// // import { Application, ReflectionKind, ProjectReflection } from 'typedoc'

// // import * as ts from 'typescript'

// // import { DUMMY_APPLICATION_OWNER } from 'typedoc/dist/lib/utils/component'

// // import { Converter } from 'typedoc/dist/lib/converter'

// import { Application } from 'typedoc'
// import * as Handlebars from 'handlebars'

// import * as fs from 'fs'

// // import project_manifest from 'project.json'

// // const { name: project_name, children: project_manifest } = JSON.parse(fs.readFileSync('project.json', 'utf-8'))

// // console.log(project_name)

// // console.log(Object.keys(project_manifest).length)


// const a = new Application({ tsconfig: './tsconfig.json' })



// const project = a.convert(['./lib/utils.ts'])

// if (!project) throw new Error()

// console.log(project.name)
// console.log(project.kind)
// console.log(project.children)
// console.log(project.comment)
