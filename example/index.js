import { fromEvent } from 'rxjs';
import { map, flatMap, takeUntil, take } from 'rxjs/operators';

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

  dragstart$.subscribe(console.log, null, () => console.log('end'));
  // dragmove$.subscribe(console.log, null, () => console.log('end'));
  dragend$.subscribe(e => console.log('end', e), null, () => console.log('end'));

//   dragstart$.subscribe(console.log);
//   mousemove$.subscribe(console.log);
//   mouseup$.subscribe(console.log);
}

