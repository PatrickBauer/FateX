/**
 * FateX base class for all actor sheets.
 * Defines what information on the actorsheet may be rendered.
 */
export class ActorSheetFate extends ActorSheet {

    /**
     * Defines the default options for all FateX actor sheets.
     * This consists of things like css classes, the template to load and the tab configuration.
     *
     * @returns {Object}
     */
    static get defaultOptions() {
        const options = super.defaultOptions;

        mergeObject(options, {
            classes: options.classes.concat([
                'fatex fatex__sheet',
            ]),
            template: "systems/fatex/templates/actor/character.html",
            tabs: [{navSelector: ".fatex__tabs__navigation", contentSelector: ".fatex__tabs__content", initial: "skills"}],
            scrollY: [".desk__content"],
            width: 860,
        });

        return options;
    }

    /**
     * Activates DOM-listeners on elements to react to different events like "click" or "change".
     * ItemTypes and sheet components can activate their own listeners and receive the sheet as a reference.
     *
     * @param html
     *  The rendered html content of the created actor sheet.
     */
    activateListeners(html) {
        super.activateListeners(html);

        // Custom sheet listeners for every ItemType
        for (let itemType in CONFIG.FateX.itemTypes) {
            CONFIG.FateX.itemTypes[itemType].activateActorSheetListeners(html, this);
        }

        // Custom sheet listeners for every SheetComponent
        for (let sheetComponent in CONFIG.FateX.sheetComponents.actor) {
            CONFIG.FateX.sheetComponents.actor[sheetComponent].activateListeners(html, this);
        }
    }

    /**
     * Returns all data that is needed to render the sheet.
     * All variables are available inside the handelbar templates.
     *
     * Items are split into their categories for easier access.
     *
     * returns {Object}
     */
    getData() {
        // Basic fields and flags
        let data = {
            owner: this.actor.owner,
            options: this.options,
            editable: this.isEditable,
            isTemplateActor: this.actor.isTemplateActor,
            isEmptyActor: !this.actor.items.size,
            config: CONFIG.FateX,
        };

        // Add actor, actor data and item
        data.actor = duplicate(this.actor.data);
        data.data = data.actor.data;
        data.items = this.actor.items.map(i => i.data).sort(this._sortItems)

        // Add filtered item lists for easier access
        data.stress = data.items.filter(item => item.type === 'stress');
        data.aspects = data.items.filter(item => item.type === 'aspect');
        data.skills = data.items.filter(item => item.type === 'skill');
        data.stunts = data.items.filter(item => item.type === 'stunt');
        data.extras = data.items.filter(item => item.type === 'extra');
        data.consequences = data.items.filter(item => item.type === 'consequence');

        // Allow every itemtype to add data to the actorsheet
        for (let itemType in CONFIG.FateX.itemTypes) {
            data = CONFIG.FateX.itemTypes[itemType].getActorSheetData(data, this);
        }

        return data;
    }

    /**
     * Adds FateX specific buttons to the sheets header bar.
     *
     * @returns {*}
     *   A list of buttons to be rendered.
     */
    _getHeaderButtons() {
        let buttons = super._getHeaderButtons();

        // Edit mode button to toggle which interactive elements are visible on the sheet.
        const canConfigure = game.user.isGM || this.actor.owner;
        if (this.options.editable && canConfigure) {
            buttons = [
                {
                    label: "Edit mode",
                    class: "fatex-toggle-edit-mode",
                    icon: "fas fa-edit",
                    onclick: ev => this._onToggleEditMode(ev)
                }
            ].concat(buttons);
        }

        return buttons
    }

    _sortItems(a,b) {
        return (a.sort || 0) - (b.sort || 0);
    }

    /**
     * OnClick handler for the previously declaried "Edit mode" button.
     * Toggles the 'fatex__helper--enable-editmode' class for the sheet container.
     */
    _onToggleEditMode(e) {
        e.preventDefault();

        const target = $(e.currentTarget);
        const app = target.parents('.app');
        const html = app.find('.window-content');

        app.toggleClass("fatex__helper--enable-editmode")
    }
}