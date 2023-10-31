const tableBody = document.getElementById('tableBody');
const addForm = document.getElementById('addForm');
const deleteForm = document.getElementById('deleteForm');

const fetchData = async () => {
  const response = await fetch('/data');
  const data = await response.json();
  tableBody.innerHTML = data.map(item => `<tr><td>${item.username}</td><td>${item.time}</td></tr>`).join('');
};

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(addForm);
  await fetch('/addOrUpdate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: formData.get('username'),
      time: Number(formData.get('time'))
    })
  });
  fetchData();
  fetchTotalTime();
  addForm.reset();
});

deleteForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(deleteForm);
  await fetch('/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: formData.get('username')
    })
  });
  fetchData();
  fetchTotalTime();
  deleteForm.reset();
});

// Function to fetch UserId and update the table
async function updateUserRow(row) {
    const usernameCell = row.querySelector("td:first-child");
    const userIdCell = document.createElement('td');

    const username = usernameCell.textContent;

    const response = await fetch('https://users.roproxy.com/v1/usernames/users', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            usernames: [username],
            excludeBannedUsers: true
        })
    });

    const data = await response.json();

    if (data.data && data.data.length > 0) {
        const thumbnailResponse = await fetch(`https://thumbnails.roproxy.com/v1/users/avatar?userIds=${data.data[0].id}&size=75x75&format=Png&isCircular=false`);
        const thumbnailData = await thumbnailResponse.json();
    
        if (thumbnailData.data && thumbnailData.data.length > 0) {
            const imageUrl = thumbnailData.data[0].imageUrl;
            
            // Create image element and set its properties
            const userImage = document.createElement('img');
            userImage.src = imageUrl;
            userImage.alt = "User's avatar";
            userImage.width = 75;
            userImage.height = 75;
            
            // Append image to the third column
            userIdCell.innerHTML = ''; // Clear the content (if there's any)
            userIdCell.appendChild(userImage);
        }
    
        row.appendChild(userIdCell);
    }
}


// Start observing the table
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === "childList") {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "TR") {
                    updateUserRow(node);
                }
            });
        }
    });
});


const totalTimeDisplay = document.getElementById('totalTimeDisplay');

const fetchTotalTime = async () => {
  const response = await fetch('/totalTime');
  const totalTime = await response.json();
  totalTimeDisplay.textContent = totalTime;
};


observer.observe(tableBody, { childList: true });

fetchData().then(() => {
    fetchTotalTime();
});
