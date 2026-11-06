(function () {
  "use strict";

  const form = document.querySelector("[data-media-form]");
  const library = document.querySelector("[data-media-library]");
  const template = document.querySelector("#media-card-template");
  const previewImage = document.querySelector("[data-preview-image]");
  const fileInput = form.elements.file;
  const srcInput = form.elements.src;

  async function fetchGallery() {
    const response = await fetch("api/gallery.php", {
      cache: "no-store"
    });

    return response.json();
  }

  async function renderLibrary() {
    const media = await fetchGallery();

    library.innerHTML = "";

    if (!media.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No images found in the gallery folders.";
      library.appendChild(empty);
      return;
    }

    media.forEach((item) => {
      const card = template.content.firstElementChild.cloneNode(true);
      const image = card.querySelector("img");
      const category = card.querySelector("span");
      const title = card.querySelector("h3");
      const details = card.querySelector("p");

      image.src = item.src;
      image.alt = item.alt;
      category.textContent = item.category;
      title.textContent = item.title;
      details.textContent = item.src;

      const editBtn = card.querySelector("[data-edit]");
      const deleteBtn = card.querySelector("[data-delete]");

      editBtn.remove();

      deleteBtn.addEventListener("click", async () => {
        const ok = confirm("Delete this image permanently from the folder?");

        if (!ok) return;

        await fetch("api/delete.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            src: item.src
          })
        });

        renderLibrary();
      });

      library.appendChild(card);
    });
  }

  function previewFile(file) {
    if (!file) return;

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      previewImage.src = reader.result;
    });

    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const file = fileInput.files[0];

    if (!file) {
      fileInput.focus();
      return;
    }

    const formData = new FormData();
    formData.append("category", form.elements.category.value);
    formData.append("image", file);

    const response = await fetch("api/upload.php", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (!result.success) {
      alert(result.message || "Upload failed");
      return;
    }

    srcInput.value = result.src;

    form.reset();
    previewImage.removeAttribute("src");

    await renderLibrary();

    alert("Image uploaded successfully.");
  }

  form.addEventListener("submit", handleSubmit);

  fileInput.addEventListener("change", () => {
    previewFile(fileInput.files[0]);
  });

  document.querySelector("[data-reset-form]").addEventListener("click", () => {
    form.reset();
    previewImage.removeAttribute("src");
  });

  document.querySelector("[data-clear-library]").addEventListener("click", () => {
    alert("For safety, bulk delete is disabled. Delete images one by one.");
  });

  document.querySelector("[data-export]").addEventListener("click", async () => {
    const media = await fetchGallery();
    const json = JSON.stringify(media, null, 2);

    try {
      await navigator.clipboard.writeText(json);
      alert("Gallery JSON copied.");
    } catch (error) {
      console.log(json);
      alert("Could not copy. Check console.");
    }
  });

  renderLibrary();
})();