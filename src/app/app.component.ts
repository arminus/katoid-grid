import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { KtdGridComponent, KtdGridItemResizeEvent, KtdGridLayout } from '@katoid/angular-grid-layout';
import { Subscription, debounceTime, fromEvent, merge } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(KtdGridComponent, { static: true }) grid!: KtdGridComponent;
  now!: string;
  constructor(private title: Title, private router: Router, private cd: ChangeDetectorRef) {}

  cols = 12;
  rowHeight = 50;
  gap = 10;
  compactType: 'vertical' | 'horizontal' | null = 'vertical';
  layout: KtdGridLayout = [
    { id: '0', x: 0, y: 0, w: 6, h: 5, minW: 6, minH: 5 },
    { id: '1', x: 6, y: 0, w: 6, h: 5, minW: 6, minH: 5 },
    { id: '2', x: 0, y: 5, w: 12, h: 6, minW: 12, minH: 4, maxW: 12, maxH: 14 },
  ];
  layoutSizes: { [id: string]: [number, number] } = {};
  private resizeSubscription: Subscription | undefined;

  ngOnInit(): void {
    this.now = new Date().toLocaleString();
    this.title.setTitle('Dashboard');
    this.resizeSubscription = merge(fromEvent(window, 'resize'), fromEvent(window, 'orientationchange'))
      .pipe(debounceTime(50))
      .subscribe(() => {
        this.grid.resize();
        this.calculateLayoutSizes();
      });
    // without this, the grid doesn't properly initialize
    window.dispatchEvent(new Event('resize'));
  }

  ngOnDestroy() {
    this.resizeSubscription!.unsubscribe();
  }

  refreshDashboard() {
    const currenturl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => this.router.navigate([currenturl]));
  }

  onLayoutUpdated(layout: KtdGridLayout) {
    this.layout = layout;
    this.calculateLayoutSizes();
  }

  onGridItemResize(gridItemResizeEvent: KtdGridItemResizeEvent) {
    this.layoutSizes[gridItemResizeEvent.gridItemRef.id] = [gridItemResizeEvent.width, gridItemResizeEvent.height];
    this.cd.detectChanges();
  }

  /**
   * Calculates and sets the property 'this.layoutSizes' with the [width, height] of every item.
   * This is needed to set manually the [width, height] for every grid item that is a chart.
   */
  private calculateLayoutSizes() {
    const gridItemsRenderData = this.grid.getItemsRenderData();
    this.layoutSizes = Object.keys(gridItemsRenderData).reduce(
      (acc, cur) => ({
        ...acc,
        [cur]: [gridItemsRenderData[cur].width, gridItemsRenderData[cur].height],
      }),
      {},
    );
  }

  /**
   * Fired when a mousedown happens on the remove grid item button.
   * Stops the event from propagating an causing the drag to start.
   * We don't want to drag when mousedown is fired on remove icon button.
   */
  stopEventPropagation(event: Event) {
    console.log('stopEventPropagation');
    event.preventDefault();
    event.stopPropagation();
  }

  /** Removes the item from the layout */
  // From https://github.com/katoid/angular-grid-layout/blob/main/projects/demo-app/src/app/playground/playground.component.ts
  removeItem(id: string) {
    // Important: Don't mutate the array. Let Angular know that the layout has changed creating a new reference.
    // FIXME: not working -> Couldn't find the specified grid item for the id: 2
    // -> https://github.com/katoid/angular-grid-layout/issues/78
    console.log('removeItem ' + id);
    this.layout = this.ktdArrayRemoveItem(this.layout, item => item.id === id);
  }

  /**
   * Removes and item from an array. Returns a new array instance (it doesn't mutate the source array).
   * @param array source array to be returned without the element to remove
   * @param condition function that will return true for the item that we want to remove
   */
  private ktdArrayRemoveItem<T>(array: T[], condition: (item: T) => boolean) {
    console.log('ktdArrayRemoveItem');
    const arrayCopy = [...array];
    const index = array.findIndex(item => condition(item));
    if (index > -1) {
      arrayCopy.splice(index, 1);
    }
    return arrayCopy;
  }
}
