import { formatTipos } from './arrayTipo'

const fisico =
  '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="rgb(255, 115, 0)" d="M101.6 68.2C92 61.7 79.2 62.9 71 71C62.8 79.1 61.7 92 68.2 101.6L180.2 264.9L80.6 297.2C70.7 300.4 64 309.6 64 320C64 330.4 70.7 339.6 80.6 342.8L183.7 376.2L130.8 476.8C125.9 486.1 127.6 497.5 135.1 504.9C142.6 512.3 153.9 514.1 163.2 509.2L263.8 456.3L297.2 559.4C300.4 569.3 309.6 576 320 576C330.4 576 339.6 569.3 342.8 559.4L376.2 456.3L476.8 509.2C486.1 514.1 497.5 512.4 504.9 504.9C512.3 497.4 514.1 486.1 509.2 476.8L456.3 376.2L559.4 342.8C569.3 339.6 576 330.4 576 320C576 309.6 569.3 300.4 559.4 297.2L452.9 262.7L478.6 192.3C481.8 183.5 479.6 173.7 473 167.1C466.4 160.5 456.6 158.3 447.8 161.5L377.4 187.2L342.9 80.7C339.6 70.7 330.4 64 320 64C309.6 64 300.4 70.7 297.2 80.6L264.9 180.2L101.6 68.2z"/></svg>'
const especial =
  '<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 640 640"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="rgb(169, 75, 246)" d="M512 320C512 214 426 128 320 128C214 128 128 214 128 320C128 426 214 512 320 512C426 512 512 426 512 320zM64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM320 400C364.2 400 400 364.2 400 320C400 275.8 364.2 240 320 240C275.8 240 240 275.8 240 320C240 364.2 275.8 400 320 400zM320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320C176 240.5 240.5 176 320 176zM288 320C288 302.3 302.3 288 320 288C337.7 288 352 302.3 352 320C352 337.7 337.7 352 320 352C302.3 352 288 337.7 288 320z"/></svg>'

const status =
  '<svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 512 512"><!--!Font Awesome Free v7.2.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--><path fill="rgb(243, 243, 243)" d="M115.5 7.4c13.6-11.3 33.8-9.5 45.1 4.1s9.5 33.8-4.1 45.1C100.2 103.5 64 175.2 64 256 64 362 150 448 256 448s192-86 192-192c0-75.1-60.9-136-136-136S176 180.9 176 256c0 44.2 35.8 80 80 80s80-35.8 80-80c0-13.3-10.7-24-24-24s-24 10.7-24 24c0 17.7-14.3 32-32 32s-32-14.3-32-32c0-48.6 39.4-88 88-88s88 39.4 88 88c0 79.5-64.5 144-144 144S112 335.5 112 256c0-110.5 89.5-200 200-200s200 89.5 200 200c0 141.4-114.6 256-256 256S0 397.4 0 256C0 155.8 45 66.1 115.5 7.4z"/></svg>'

export const columns = [
  {
    data: 'type',
    title: 'Tipo',
    width: '10%',
    className: 'text-center px-4 py-3',
    render: function (data, type, row) {
      const tipo = formatTipos(data)
      return `<span class="px-2 py-1 rounded-full ${tipo.color} text-white ">${tipo.tipo}</span>`
    },
  },
  {
    data: 'category',
    title: 'Categoría',
    width: '10%',
    className: 'text-center px-4 py-3',
    render: function (data) {
      if (data === 'physical') {
        // ancho fijo para uniformidad
        return `<span class="px-2 py-0.5 w-25 rounded-full bg-red-500 text-white inline-flex items-center justify-center"><span class="mr-1">${fisico}</span> Físico</span>`
      } else if (data === 'special') {
        return `<span class="px-2 py-0.5 w-25 rounded-full bg-blue-500 text-white inline-flex items-center justify-center"><span class="mr-1">${especial}</span> Especial</span>`
      } else if (data === 'status') {
        return `<span class="px-2 py-0.5 w-25 rounded-full bg-green-500 text-white inline-flex items-center justify-center"><span class="mr-1">${status}</span> Estado</span>`
      } else {
        return `<span class="px-2 py-0.5 w-25 rounded-full bg-gray-500 text-white inline-flex items-center justify-center"><span class="mr-1">${data}</span></span>`
      }
    },
  },
  {
    data: 'name',
    title: 'Movimiento',
    width: '10%',
    className: 'text-left px-4 py-3',
    render: function (data) {
      return `<span class="bg-gray-200 px-3 py-1 rounded-full">${data}</span>`
    },
  },
  {
    data: 'power',
    title: 'Poder',
    width: '10%',
    className: 'text-center px-4 py-3',
  },
  {
    data: 'pp',
    title: 'PP',
    width: '10%',
    className: 'text-center px-4 py-3',
  },
]
