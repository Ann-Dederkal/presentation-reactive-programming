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
      map(({ x, y }) => document.elementFromPoint(x, y)),
      tap(dragEl => dragEl.classList.add('active')),
      share(),
    );

  const previewElement$ = dragstart$
    .pipe(
      withLatestFrom(dragElement$),
      map(([{ x, y }, dragEl]) => createPreviewElement(dragEl, x, y)),
      tap(previewElement => body.appendChild(previewElement)),
      share(),
    );

  const movePreviewElement$ = dragmove$
    .pipe(
      withLatestFrom(previewElement$),
      tap(([{ x, y }, previewEl]) => movePreviewElement(previewEl, x, y)),
    );

  const moveDragElement$ = dragmove$
    .pipe(
      withLatestFrom(dragElement$),
      sampleTime(200),
      tap(([{ x, y }, dragEl]) => moveDragElement(dragEl, x, y)),
    );

  const finishMovement$ = dragend$
    .pipe(
      withLatestFrom(previewElement$, dragElement$),
      tap(([_, previewEl, dragEl]) => {
        previewEl.remove();
        dragEl.classList.remove('active');
      }),
    );

  movePreviewElement$.subscribe(() => {});
  moveDragElement$.subscribe(() => {});
  finishMovement$.subscribe(() => {});
}

function movePreviewElement(previewEl, x, y) {
  Object.assign(previewEl.style, {
    left: `${x}px`,
    top: `${y}px`,
  });
}

function moveDragElement(dragEl, x, y) {
  const elInsert = document.elementFromPoint(x, y);
  const wrapper = document.getElementById('wrapper');
  if (elInsert.parentNode === wrapper) {
    insertAfter(dragEl, elInsert);
  }
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
