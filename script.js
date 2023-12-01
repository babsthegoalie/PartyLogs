const newPartyForm = document.querySelector('#new-party-form');
const partyContainer = document.querySelector('#party-container');

const PARTIES_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/parties';
const GUESTS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/guests';
const RSVPS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/rsvps';
const GIFTS_API_URL = 'http://fsa-async-await.herokuapp.com/api/workshop/gifts';

// get all parties
const getAllParties = async () => {
  try {
    const response = await fetch(PARTIES_API_URL);
    const parties = await response.json();
    return parties;
  } catch (error) {
    console.error(error);
  }
};

// get single party by id
const getPartyById = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`);
    const party = await response.json();
    return party;
  } catch (error) {
    console.error(error);
  }
};

// Function to render individual party details
const renderSinglePartyById = async (id) => {
  try {
    // fetch party details from server
    const party = await getPartyById(id);
    console.log(`Party details fetched for party with ID: ${id}`);

    // GET - /api/workshop/guests/party/:partyId - get guests by party id
    const guestsResponse = await fetch(`${GUESTS_API_URL}/party/${id}`);
    const guests = await guestsResponse.json();

    // GET - /api/workshop/rsvps/party/:partyId - get RSVPs by partyId
    const rsvpsResponse = await fetch(`${RSVPS_API_URL}/party/${id}`);
    const rsvps = await rsvpsResponse.json();

    const partyDetailsElement = document.createElement('div');
    partyDetailsElement.classList.add('party-details');
    partyDetailsElement.innerHTML = `
      <p>${party.description}</p>
      <p>${party.time}</p>
      <p>${party.location}</p>
      <h3>Guests:</h3>
      <ul>
        ${guests
          .map(
            (guest, index) => `
              <li>
                <div>${guest.name}</div>
                <div>${rsvps[index].status}</div>
              </li>
            `
          )
          .join('')}
      </ul>
      <div class="button-container">
        <button class="close-button">Close</button>
        <button class="delete-button">Delete</button>
      </div>
    `;

    const closeButton = partyDetailsElement.querySelector('.close-button');
    const deleteButton = partyDetailsElement.querySelector('.delete-button');

    // Set buttons to display inline
closeButton.style.display = 'inline';
deleteButton.style.display = 'inline';


    closeButton.addEventListener('click', () => {
      partyDetailsElement.remove();
      const detailsButton = document.querySelector(`.details-button[data-id="${id}"]`);
      if (detailsButton) {
        detailsButton.style.display = 'inline-block'; // Show the 'See Details' button again
      }
    });

    deleteButton.addEventListener('click', async () => {
      await deletePartyById(id);
    });

    return partyDetailsElement;
  } catch (error) {
    console.error(error);
  }
};

// Function to delete a party by id
const deletePartyById = async (id) => {
  try {
    const response = await fetch(`${PARTIES_API_URL}/${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    console.log(result.message); // Assuming the API returns a message
    // Refresh parties after deletion
    const updatedParties = await getAllParties();
    displayParties(updatedParties);
  } catch (error) {
    console.error(error);
  }
};

// Function to render all parties
const displayParties = async (parties) => {
  try {
    partyContainer.innerHTML = '';
    parties.forEach((party) => {
      const partyElement = document.createElement('div');
      partyElement.classList.add('party');
      partyElement.innerHTML = `
        <h2>${party.name}</h2>
        <p>${party.date}</p>
        <button class="details-button" data-id="${party.id}">See Details</button>
        <button class="delete-button" data-id="${party.id}">Delete</button>
      `;
      partyContainer.appendChild(partyElement);

      const detailsButton = partyElement.querySelector('.details-button');
      detailsButton.addEventListener('click', async (event) => {
        const partyId = event.target.dataset.id;
        const partyDetailsElement = await renderSinglePartyById(partyId);
        if (partyDetailsElement) {
          const partyDetailsContainer = document.createElement('div');
          partyDetailsContainer.classList.add('party-details-container');
          partyDetailsContainer.appendChild(partyDetailsElement);
          partyElement.appendChild(partyDetailsContainer);

          // Hide details button after displaying details
          detailsButton.style.display = 'none';
        }
      });

      const deleteButton = partyElement.querySelector('.delete-button');
      deleteButton.addEventListener('click', async (event) => {
        const partyId = event.target.dataset.id;
        await deletePartyById(partyId);
      });
    });
  } catch (error) {
    console.error(error);
  }
};

// Delegating event handling to the container
partyContainer.addEventListener('click', async (event) => {
  const detailsButton = event.target.closest('.details-button');
  const deleteButton = event.target.closest('.delete-button');

  if (detailsButton) {
    const partyId = detailsButton.dataset.id;
    const partyDetailsElement = await renderSinglePartyById(partyId);
    if (partyDetailsElement) {
      const detailsContainer = document.createElement('div');
      detailsContainer.classList.add('party-details-container');
      detailsContainer.appendChild(partyDetailsElement);

      // Move the delete button next to the close button within partyDetailsElement
      const closeButton = partyDetailsElement.querySelector('.close-button');
      const deleteButton = event.target.closest('.delete-button');

      // Check for null elements and parent nodes before insertion
      if (closeButton && deleteButton && partyDetailsElement.parentNode && clickedPartyElement.parentNode) {
        partyDetailsElement.insertBefore(deleteButton, closeButton.nextSibling);
        clickedPartyElement.parentNode.insertBefore(detailsContainer, clickedPartyElement.nextSibling);

        // Toggle button visibility
        toggleButtonVisibility(detailsButton, false);
      }
    }
  }

  if (deleteButton) {
    const partyId = deleteButton.dataset.id;
    await deletePartyById(partyId);
  }
});

// Init function to initialize the application
const init = async () => {
  try {
    const parties = await getAllParties();
    displayParties(parties);
  } catch (error) {
    console.error(error);
  }
};

init();