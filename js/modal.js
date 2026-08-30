/*
 * This file contains no Markdown Renderer functionality.
 * It is responsible only for Modal functionality.
 *
 * This is a standalone Modal module.
 *
 * Modal IDs are not defined or registered in this file.
 * The calling script provides the Modal ID when opening or closing a Modal.
 */
(() => {
    let currentModal = null;

    function openModal(id) {
        const modal = document.getElementById(id);

        if (!modal) return;

        modal.hidden = false;
        /* Prevent background scrolling while the modal popup is loading.
           Refer to the body.prevent-background-scroll class in /css/site.css. */
        document.body.classList.add("prevent-background-scroll");

        currentModal = modal;
    }

    function closeModal() {
        if (!currentModal) return;

        currentModal.hidden = true;
        document.body.classList.remove("prevent-background-scroll");

        currentModal = null;
    }

    // Close a Modal when its close button is clicked.
    document.addEventListener("click", event => {
        // Code to close currentModal only when the X or Close button is clicked.
        if (!event.target.closest("[data-modal-close]")) return;

        closeModal();
    });

    // Close the currently visible Modal with Escape.
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;

        closeModal();
    });

    window.KjvamaModal = {
        open: openModal,
        close: closeModal
    };
})();