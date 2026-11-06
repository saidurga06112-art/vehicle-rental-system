
(function () {

  const tbody = document.getElementById("vehicleTableBody");

  const bookingBody = document.getElementById("bookingTableBody");

  const modal = document.getElementById("vehicleModal");

  const form = document.getElementById("vehicleForm");

  const message = document.getElementById("adminMessage");

  const formMessage = document.getElementById("vehicleFormMessage");

  const search = document.getElementById("adminSearch");

  let vehicles = [];


  // ==========================
  // SHOW MESSAGE
  // ==========================

  function showMessage(text, error = false) {

    message.textContent = text;

    message.classList.toggle("error", error);

  }


  // ==========================
  // OPEN MODAL
  // ==========================

  function openModal(vehicle = null) {

    form.reset();

    form.elements.id.value = vehicle
      ? vehicle.vehicle_id
      : "";


    if (vehicle) {

      form.elements.veh_name.value =
        vehicle.veh_name || "";

      form.elements.vehicle_num.value =
        vehicle.vehicle_num || "";

      form.elements.veh_time.value =
        vehicle.veh_time || "";

      form.elements.veh_model.value =
        vehicle.veh_model || "";

      form.elements.rent_per_day.value =
        vehicle.rent_per_day || "";

      form.elements.status.value =
        vehicle.status || "Available";

      form.elements.image_url.value =
        vehicle.image_url || "";


      document.getElementById("modalTitle").textContent =
        "Edit vehicle";

    } else {

      form.elements.status.value = "Available";

      form.elements.image_url.value =
        "images/car-default.svg";


      document.getElementById("modalTitle").textContent =
        "Add vehicle";

    }


    formMessage.textContent = "";

    formMessage.classList.remove("error");


    modal.classList.add("open");

    modal.setAttribute("aria-hidden", "false");

  }


  // ==========================
  // CLOSE MODAL
  // ==========================

  function closeModal() {

    modal.classList.remove("open");

    modal.setAttribute("aria-hidden", "true");

  }


  document
    .getElementById("newVehicleBtn")
    .addEventListener("click", function () {

      openModal();

    });


  modal
    .querySelectorAll("[data-close-modal]")
    .forEach(function (element) {

      element.addEventListener("click", closeModal);

    });


  document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

      closeModal();

    }

  });


  // ==========================
  // RENDER VEHICLES
  // ==========================

  function renderVehicles() {

    const term = search.value.trim().toLowerCase();


    const filtered = vehicles.filter(function (vehicle) {

      const text = [

        vehicle.vehicle_id,

        vehicle.veh_name,

        vehicle.vehicle_num,

        vehicle.veh_model,

        vehicle.status

      ].join(" ").toLowerCase();


      return text.includes(term);

    });


    if (filtered.length > 0) {

      tbody.innerHTML = filtered.map(function (vehicle) {

        return `

          <tr>

            <td>

              <div class="vehicle-cell">

                <img

                  src="${imagePath(vehicle.image_url)}"

                  alt="${escapeHtml(vehicle.veh_name)}"

                  onerror="this.onerror=null;this.src='/images/car-default.svg'"

                >

                <div>

                  <b>

                    ${escapeHtml(vehicle.veh_name)}

                  </b>

                  <small>

                    ${escapeHtml(vehicle.vehicle_num)}

                  </small>

                </div>

              </div>

            </td>


            <td class="id-cell">

              #${vehicle.vehicle_id}

            </td>


            <td>

              ${escapeHtml(vehicle.vehicle_num)}

            </td>


            <td>

              ${escapeHtml(vehicle.veh_time || "—")}

            </td>


            <td>

              ${escapeHtml(vehicle.veh_model)}

            </td>


            <td>

              <b>

                ${money(vehicle.rent_per_day)}

              </b>

            </td>


            <td>

              <span class="status ${statusClass(vehicle.status)}">

                ${escapeHtml(vehicle.status)}

              </span>

            </td>


            <td>

              <div class="actions">

                <button

                  class="icon-btn"

                  data-edit="${vehicle.vehicle_id}"

                >

                  Edit

                </button>


                <button

                  class="icon-btn delete-btn"

                  data-delete="${vehicle.vehicle_id}"

                >

                  Delete

                </button>

              </div>

            </td>

          </tr>

        `;

      }).join("");

    } else {

      tbody.innerHTML = `

        <tr>

          <td colspan="8" class="empty-cell">

            No vehicles found.

          </td>

        </tr>

      `;

    }


    // ==========================
    // STATISTICS
    // ==========================

    document.getElementById("totalVehicles").textContent =
      vehicles.length;


    document.getElementById("availableVehicles").textContent =

      vehicles.filter(function (vehicle) {

        return vehicle.status === "Available";

      }).length;


    document.getElementById("busyVehicles").textContent =

      vehicles.filter(function (vehicle) {

        return vehicle.status !== "Available";

      }).length;


    // ==========================
    // EDIT VEHICLE
    // ==========================

    tbody
      .querySelectorAll("[data-edit]")
      .forEach(function (button) {

        button.addEventListener("click", function () {

          const id = Number(button.dataset.edit);


          const vehicle = vehicles.find(function (vehicle) {

            return Number(vehicle.vehicle_id) === id;

          });


          if (vehicle) {

            openModal(vehicle);

          }

        });

      });


    // ==========================
    // DELETE VEHICLE
    // ==========================

    tbody
      .querySelectorAll("[data-delete]")
      .forEach(function (button) {

        button.addEventListener("click", async function () {

          const id = button.dataset.delete;


          const vehicle = vehicles.find(function (vehicle) {

            return Number(vehicle.vehicle_id) === Number(id);

          });


          const name = vehicle
            ? vehicle.veh_name
            : "this vehicle";


          if (!confirm("Delete " + name + "?")) {

            return;

          }


          try {

            const result = await api(

              "/api/vehicles/" + id,

              {

                method: "DELETE"

              }

            );


            showMessage(

              result.message || "Vehicle deleted successfully."

            );


            await loadVehicles();


          } catch (error) {

            showMessage(error.message, true);

          }

        });

      });

  }


  // ==========================
  // LOAD VEHICLES
  // ==========================

  async function loadVehicles() {

    try {

      vehicles = await api("/api/vehicles");


      if (!Array.isArray(vehicles)) {

        throw new Error("Invalid vehicle data received.");

      }


      renderVehicles();


    } catch (error) {

      tbody.innerHTML = `

        <tr>

          <td colspan="8" class="empty-cell">

            ${escapeHtml(error.message)}

          </td>

        </tr>

      `;


      showMessage(error.message, true);

    }

  }


  // ==========================
  // LOAD BOOKINGS
  // ==========================

  async function loadBookings() {

    try {

      const bookings = await api("/api/bookings");


      if (bookings.length > 0) {

        bookingBody.innerHTML = bookings.map(function (booking) {

          return `

            <tr>

              <td>

                #${booking.id}

              </td>


              <td>

                ${escapeHtml(booking.customer_name)}

                <small class="vehicle-sub">

                  ${escapeHtml(booking.phone)}

                </small>

              </td>


              <td>

                ${escapeHtml(booking.model)}

                <small class="vehicle-sub">

                  ${escapeHtml(booking.vehicle_num)}

                </small>

              </td>


              <td>

                ${escapeHtml(String(booking.pickup_date).slice(0, 10))}

              </td>


              <td>

                ${escapeHtml(String(booking.return_date).slice(0, 10))}

              </td>


              <td>

                <b>

                  ${money(booking.total_amount)}

                </b>

              </td>


              <td>

                <span class="status ${statusClass(booking.status)}">

                  ${escapeHtml(booking.status)}

                </span>

              </td>


              <td>

                <select

                  class="booking-status"

                  data-booking="${booking.id}"

                  aria-label="Update booking ${booking.id}"

                >

                  <option

                    value="Booked"

                    ${booking.status === "Booked" ? "selected" : ""}

                  >

                    Booked

                  </option>


                  <option

                    value="Confirmed"

                    ${booking.status === "Confirmed" ? "selected" : ""}

                  >

                    Confirmed

                  </option>


                  <option

                    value="Returned"

                    ${booking.status === "Returned" ? "selected" : ""}

                  >

                    Returned

                  </option>


                  <option

                    value="Cancelled"

                    ${booking.status === "Cancelled" ? "selected" : ""}

                  >

                    Cancelled

                  </option>

                </select>

              </td>

            </tr>

          `;

        }).join("");

      } else {

        bookingBody.innerHTML = `

          <tr>

            <td colspan="8" class="empty-cell">

              No bookings yet.

            </td>

          </tr>

        `;

      }


      // ==========================
      // BOOKING STATUS
      // ==========================

      bookingBody
        .querySelectorAll(".booking-status")
        .forEach(function (select) {

          select.addEventListener("change", async function () {

            try {

              await api(

                "/api/bookings/" +
                select.dataset.booking +
                "/status",

                {

                  method: "PUT",

                  body: JSON.stringify({

                    status: select.value

                  })

                }

              );


              showMessage("Booking status updated.");


              await loadVehicles();

              await loadBookings();


            } catch (error) {

              showMessage(error.message, true);

              await loadBookings();

            }

          });

        });


    } catch (error) {

      bookingBody.innerHTML = `

        <tr>

          <td colspan="8" class="empty-cell">

            ${escapeHtml(error.message)}

          </td>

        </tr>

      `;

    }

  }


  // ==========================
  // ADD / EDIT VEHICLE
  // ==========================

  form.addEventListener("submit", async function (event) {

    event.preventDefault();


    const data = Object.fromEntries(

      new FormData(form)

    );


    const id = data.id;

    delete data.id;


    // ==========================
    // REQUIRED FIELDS
    // ==========================

    const requiredFields = [

      "veh_name",

      "vehicle_num",

      "veh_time",

      "veh_model",

      "rent_per_day",

      "status"

    ];


    for (const field of requiredFields) {

      if (

        !data[field] ||

        !String(data[field]).trim()

      ) {

        formMessage.textContent =

          "Please enter all required vehicle details.";


        formMessage.classList.add("error");

        return;

      }

    }


    // ==========================
    // RENT VALIDATION
    // ==========================

    if (Number(data.rent_per_day) <= 0) {

      formMessage.textContent =

        "Rent per day must be greater than zero.";


      formMessage.classList.add("error");

      return;

    }


    // ==========================
    // SAVE VEHICLE
    // ==========================

    formMessage.textContent = "Saving…";

    formMessage.classList.remove("error");


    try {

      const result = await api(

        id

          ? "/api/vehicles/" + id

          : "/api/vehicles",

        {

          method: id ? "PUT" : "POST",

          body: JSON.stringify(data)

        }

      );


      formMessage.textContent =

        result.message || "Vehicle saved successfully.";


      showMessage(

        result.message || "Vehicle saved successfully."

      );


      await loadVehicles();


      setTimeout(function () {

        closeModal();

      }, 700);


    } catch (error) {

      formMessage.textContent = error.message;

      formMessage.classList.add("error");

    }

  });


  // ==========================
  // SEARCH
  // ==========================

  search.addEventListener("input", function () {

    renderVehicles();

  });


  // ==========================
  // REFRESH BOOKINGS
  // ==========================

  document

    .getElementById("refreshBookings")

    .addEventListener("click", function () {

      loadBookings();

    });


  // ==========================
  // INITIAL LOAD
  // ==========================

  loadVehicles();

  loadBookings();


})();
