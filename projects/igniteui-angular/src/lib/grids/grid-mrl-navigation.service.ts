import { Injectable } from '@angular/core';
import { IgxGridBaseComponent, FilterMode } from './grid-base.component';
import { first } from 'rxjs/operators';
import { IgxColumnComponent } from './column.component';
import { IgxGridGroupByRowComponent } from './grid/groupby-row.component';
import { IgxGridCellComponent } from './tree-grid';
import { IgxGridNavigationService } from './grid-navigation.service';

/** @hidden */
@Injectable()
export class IgxGridMRLNavigationService extends IgxGridNavigationService {
    public grid: IgxGridBaseComponent;

    public navigateUp(rowElement, currentRowIndex, visibleColumnIndex, cell?) {
        this.focusCellUpFromLayout(cell);
    }

    public navigateDown(rowElement, currentRowIndex, visibleColumnIndex, cell?) {
        this.focusCellDownFromLayout(cell);
    }

    public isColumnFullyVisible(visibleColumnIndex: number) {
        const forOfDir =  this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.columnList.toArray()[visibleColumnIndex];
        if (!horizontalScroll.clientWidth || column.pinned) {
            return true;
        }
        return this.displayContainerWidth >= forOfDir.getColumnScrollLeft(column.visibleIndex) - this.displayContainerScrollLeft;
    }

    public isColumnLeftFullyVisible(visibleColumnIndex) {
        const forOfDir = this.grid.headerContainer;
        const horizontalScroll = forOfDir.getHorizontalScroll();
        const column = this.grid.columnList.toArray()[visibleColumnIndex];
        if (!horizontalScroll.clientWidth || column.pinned) {
            return true;
        }
        return this.displayContainerScrollLeft <= forOfDir.getColumnScrollLeft(column.visibleIndex);
    }

    public onKeydownArrowRight(element, rowIndex, visibleColumnIndex, isSummary = false, cell?) {
        this.focusNextCellFromLayout(cell);
    }

    public onKeydownArrowLeft(element, rowIndex, visibleColumnIndex, isSummary = false, cell?) {
        this.focusPrevCellFromLayout(cell);
    }

    private focusCellUpFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;

        const currentRowStart = cell.rowStart;
        const currentColStart = cell.colStart;

        // element up is from the same layout
        let upperElementColumn = columnLayout.children.find(c =>
            (c.rowEnd === currentRowStart || c.rowStart + c.gridRowSpan === currentRowStart)  &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(upperElementColumn);
        const upperElement = element.children[columnIndex];

        if (!upperElement) {
            const layoutRowEnd = this.grid.multiRowLayoutRowSize + 1;
            upperElementColumn = columnLayout.children.find(c =>
                (c.rowEnd === layoutRowEnd || c.rowStart + c.gridRowSpan === layoutRowEnd) &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
            columnIndex = this.grid.columns.filter(c => !c.columnLayout && !c.parent.hidden).indexOf(upperElementColumn);

            const prevIndex = cell.row.index - 1;
            let prevRow;
            const rowElement = cell.row.nativeElement;
            const containerTopOffset = parseInt(this.verticalDisplayContainerElement.style.top, 10);
            if (prevIndex >= 0 && (!rowElement.previousElementSibling ||
                rowElement.previousElementSibling.offsetTop < Math.abs(containerTopOffset))) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        prevRow = this.grid.getRowByIndex(prevIndex);
                        if (prevRow && prevRow.cells) {
                            prevRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                        }
                    });
                this.grid.verticalScrollContainer.scrollTo(prevIndex);
            } else {
                prevRow = this.grid.getRowByIndex(prevIndex);
                if (prevRow && prevRow.cells) {
                    prevRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        upperElement.focus({ preventScroll: true });
    }

    private focusCellDownFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;

        const currentRowEnd = cell.rowEnd || cell.rowStart + cell.gridRowSpan;
        const currentColStart = cell.colStart;

        // element down is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.rowStart === currentRowEnd &&
            c.colStart <= currentColStart &&
            (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
        const nextElement = element.children[columnIndex];

        if (!nextElement) {

            nextElementColumn = columnLayout.children.find(c => c.rowStart === 1 &&
                c.colStart <= currentColStart &&
                (currentColStart < c.colEnd || currentColStart < c.colStart + c.gridColumnSpan));
            columnIndex = this.grid.columns.filter(c => !c.columnLayout && !c.parent.hidden).indexOf(nextElementColumn);

            const nextIndex = cell.row.index + 1;
            let nextRow;

            const rowHeight = this.grid.verticalScrollContainer.getSizeAt(cell.row.index + 1);
            const containerHeight = this.grid.calcHeight ? Math.ceil(this.grid.calcHeight) : 0;
            const targetEndTopOffset = cell.row.nativeElement.nextElementSibling ?
            cell.row.nativeElement.nextElementSibling.offsetTop + rowHeight + parseInt(this.verticalDisplayContainerElement.style.top, 10) :
                containerHeight + rowHeight;
            if (containerHeight && containerHeight < targetEndTopOffset) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.verticalScrollContainer.onChunkLoad
                    .pipe(first())
                    .subscribe(() => {
                        nextRow = this.grid.getRowByIndex(nextIndex);
                        if (nextRow && nextRow.cells) {
                            nextRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                        }
                    });
                this.grid.verticalScrollContainer.scrollTo(nextIndex);
            } else {
                nextRow = this.grid.getRowByIndex(nextIndex);
                if (nextRow && nextRow.cells) {
                    nextRow.cells.toArray()[columnIndex].nativeElement.focus({ preventScroll: true });
                }
            }
            return;
        }
        nextElement.focus({ preventScroll: true });
    }

    private focusNextCellFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;

        const currentColEnd = cell.colEnd || cell.colStart + cell.gridColumnSpan;
        const currentRowStart = cell.rowStart;

        // next element is from the same layout
        let nextElementColumn = columnLayout.children.find(c => c.colStart === currentColEnd &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(nextElementColumn);
        let nextElement = element.children[columnIndex];

        if (!nextElement) {
            // try extracting first element from the next layout
            const currentLayoutIndex = this.grid.columns.filter(c => c.columnLayout && !c.hidden).indexOf(columnLayout);
            const nextLayout = this.grid.columns.filter(c => c.columnLayout && !c.hidden)[currentLayoutIndex + 1];
            if (!nextLayout) {
                // reached the end
                return null;
            }
            // first element is from the next layout
            nextElementColumn = nextLayout.children.find(c => c.colStart === 1 &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

            columnIndex = nextLayout.children.toArray().indexOf(nextElementColumn);
            if (!this.isColumnFullyVisible(nextElementColumn.index)) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    nextElement = element.nextElementSibling.children[columnIndex];
                    nextElement.focus({ preventScroll: true });
                });
                this.horizontalScroll(cell.rowIndex).scrollTo(nextElementColumn.parent.visibleIndex);
                return;
            } else {
                nextElement = element.nextElementSibling.children[columnIndex];
            }
        }
        nextElement.focus();
    }

    private focusPrevCellFromLayout(cell, isSummary = false) {
        const columnLayout = cell.column.parent;
        const element = cell.nativeElement.parentElement;
        const currentColStart = cell.colStart;
        const currentRowStart = cell.rowStart;

        // previous element is from the same layout
        let prevElementColumn = columnLayout.children
        .find(c => (c.colEnd === currentColStart || c.colStart + c.gridColumnSpan === currentColStart ) &&
            c.rowStart <= currentRowStart &&
            (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

        let columnIndex = columnLayout.children.toArray().indexOf(prevElementColumn);
        let prevElement = element.children[columnIndex];

        if (!prevElement) {
            // try extracting first element from the previous layout
            const currentLayoutIndex = this.grid.columns.filter(c => c.columnLayout && !c.hidden).indexOf(columnLayout);
            const prevLayout = this.grid.columns.filter(c => c.columnLayout && !c.hidden)[currentLayoutIndex - 1];
            if (!prevLayout) {
                // reached the end
                return null;
            }
            const layoutSize = prevLayout.getInitialChildColumnSizes(prevLayout.children.toArray()).length;
            // first element is from the next layout
            prevElementColumn = prevLayout.children
            .find(c => (c.colEnd === layoutSize + 1 || c.colStart + c.gridColumnSpan === layoutSize + 1) &&
                c.rowStart <= currentRowStart &&
                (currentRowStart < c.rowEnd || currentRowStart < c.rowStart + c.gridRowSpan));

            columnIndex = prevLayout.children.toArray().indexOf(prevElementColumn);

            if (!this.isColumnLeftFullyVisible(prevElementColumn.index)) {
                this.grid.nativeElement.focus({ preventScroll: true });
                this.grid.parentVirtDir.onChunkLoad
                .pipe(first())
                .subscribe(() => {
                    prevElement = element.previousElementSibling.children[columnIndex];
                    prevElement.focus({ preventScroll: true });
                });
                this.horizontalScroll(cell.rowIndex).scrollTo(prevElementColumn.parent.visibleIndex);
                return;
            } else {
                prevElement = element.previousElementSibling.children[columnIndex];
            }
        }
        prevElement.focus();
    }
}