import { fromEvent } from 'rxjs';
import { sampleTime, map, flatMap, takeUntil, take, tap, withLatestFrom, share } from 'rxjs/operators';

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
    .pipe(
      map(({ x, y }) => {
        const dragEl = document.elementFromPoint(x, y);
        dragEl.classList.add('active');
        return { dragEl, x, y };
      }),
      share(),
    );

  const previewElement$ = dragElement$
    .pipe(
      map(({ dragEl, x, y }) => createPreviewElement(dragEl, x, y)),
      tap((previewElement) => {
        body.appendChild(previewElement);
      }),
      share(),
    );

  const movePreviewElement$ = dragmove$
    .pipe(
      withLatestFrom(previewElement$),
      tap(([{ x, y }, previewEl]) => {
        Object.assign(previewEl.style, {
          left: `${x}px`,
          top: `${y}px`,
        });
      }),
    );

  const moveElement$ = dragmove$
    .pipe(
      withLatestFrom(dragElement$),
      sampleTime(200),
      tap(([{ x, y }, { dragEl }]) => {
        const elInsert = document.elementFromPoint(x, y);
        const wrapper = document.getElementById('wrapper');
        if (elInsert.parentNode === wrapper) {
          insertAfter(dragEl, elInsert);
        }
      }),
    );

  const removePreview$ = dragend$
    .pipe(
      withLatestFrom(previewElement$, dragElement$),
      tap(([_, previewEl, { dragEl }]) => {
        previewEl.remove();
        dragEl.classList.remove('active');
      }),
    );

  dragstart$.subscribe(() => {}, null, () => console.log('end'));
  movePreviewElement$.subscribe(() => {}, null, () => console.log('end'));
  moveElement$.subscribe(() => {}, null, () => console.log('end'));
  removePreview$.subscribe(e => console.log('end', e), null, () => console.log('end'));
}

function insertAfter(dragEl, el) {
  el.parentNode.insertBefore(dragEl, el.nextElementSibling);
}

function createPreviewElement(element, x, y) {
  const previewElement = element.cloneNode(true);

  const defaultPreviewStyles = {
    position: 'absolute',
    opacity: '0.8',
    pointerEvents: 'none',
    margin: '0',
    zIndex: 100,
    left: `${x}px`,
    top: `${y}px`,
  };

  previewElement.id = 'previewElement';

  Object.assign(previewElement.style, defaultPreviewStyles);

  return previewElement;
}
