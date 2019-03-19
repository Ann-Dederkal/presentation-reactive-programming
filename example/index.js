import { fromEvent } from 'rxjs';
import { map, flatMap, takeUntil, take, tap, withLatestFrom } from 'rxjs/operators';

init();

function init() {
  const { body } = document;
  const getCoordsFromEvent = event => ({ x: event.clientX, y: event.clientY });
  const mousedown$ = fromEvent(body, 'mousedown')
    .pipe(map(getCoordsFromEvent));
  const mousemove$ = fromEvent(body, 'mousemove')
    .pipe(map(getCoordsFromEvent));
  const mouseup$ = fromEvent(body, 'mouseup')
    .pipe(map(getCoordsFromEvent));

  const dragstart$ = mousedown$
    .pipe(flatMap(() => mousemove$.pipe(takeUntil(mouseup$), take(1))));
  const dragmove$ = mousedown$
    .pipe(flatMap(() => mousemove$.pipe(takeUntil(mouseup$))));
  const dragend$ = dragstart$
    .pipe(flatMap(() => mouseup$.pipe(take(1))));

  const dragElement$ = dragstart$
    .pipe(map(({ x, y }) => document.elementFromPoint(x, y)));

  const moveElement$ = dragmove$
    .pipe(
      withLatestFrom(dragElement$, ({ x, y }, el) => ({ x, y, el })),
      tap(({ x, y, el }) => {
        const elInsert = document.elementFromPoint(x, y);
        const wrapper = document.getElementById('wrapper');
        if (elInsert.parentNode === wrapper) {
          wrapper.insertBefore(el, elInsert);
        }
      }),
    );

  dragstart$.subscribe(console.log, null, () => console.log('end'));
  moveElement$.subscribe(console.log, null, () => console.log('end'));
  // dragmove$.subscribe(console.log, null, () => console.log('end'));
  dragend$.subscribe(e => console.log('end', e), null, () => console.log('end'));

//   dragstart$.subscribe(console.log);
//   mousemove$.subscribe(console.log);
//   mouseup$.subscribe(console.log);
}

// function createPreviewElement(element: ELEMENT, scale: number): ELEMENT {
//   const previewElement = element.cloneNode(true);
//   const { height, width } = element.getBoundingClientRect();
//   const { x, y } = getElementFrame(element);
//   const contentPreviewer = document.getElementById('contentPreviewer');
//   const { x: contentTop, y: contentLeft } = getElementFrame(contentPreviewer);
//   const xPreviewPosition = x - contentTop;
//   const yPreviewPosition = y - contentLeft;

//   previewElement.classList.remove('selected-component');
//   const defaultPreviewStyles = {
//     position: 'absolute',
//     opacity: '0.8',
//     pointerEvents: 'none',
//     margin: '0',
//     zIndex: 100,
//     height: height / scale,
//     width: width / scale,
//     top: `${xPreviewPosition}px`,
//     left: `${xPreviewPosition}px`,
//   };

//   previewElement.id = 'previewElement';

//   Object.assign(previewElement.style, defaultPreviewStyles);

//   previewElement.removeAttribute('data-id');
//   previewElement.removeAttribute('v-component');

//   return previewElement;
// }


// function setMoveStyle(element: ELEMENT): void {
//   element.classList.add('moving-component');
// }

// function resetMoveStyle(element: ELEMENT): void {
//   element.classList.remove('moving-component');
// }

// function appendPreviewElement(previewElement: ELEMENT): void {
//   document.querySelector('#contentPreviewer').appendChild(previewElement);
// }

// function removePreviewElement(previewElement: ELEMENT): void {
//   previewElement.remove();
// }
