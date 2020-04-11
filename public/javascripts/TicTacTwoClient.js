const partyId = partyIdInput.value;
let password = -1;
var won = false;

var socket = io.connect();

function fillField(cnt){
    for (let i=0; i<9; i++)
    {
        let color = (cnt[i] == 0) ? "var(--acc)" : "var(--acc-2)";
        if (cnt[i] != -1)
        {
            document.getElementById(i).style.backgroundColor = color;
        }
    }
}

socket.emit('connectToParty', {id:partyId}); 

socket.on('responseToConnection', (cnt)=>{
    password = cnt.pass;
    fillField(cnt.field);
    console.log("Logged : " + password);
})

socket.on('newField', res => {
    fillField(res.field);
    if (res.success != null)
    {
        won = true;
        if (res.success == 3)
        {
            victorySpan.innerText = "Draw !\n"; 
        }
        else
        {
            victorySpan.innerText = "Player " + res.success + " has won !\n"; 
        }
        victorySpan.innerText += "This party will be deleted in one minute"; 
    }
})

let field = document.getElementsByClassName('cell');
for (let i=0; i<9; i++)
{
    field[i].addEventListener('click', (event)=>{
        let slot = event.target.id;
        if (!won) socket.emit('play', {id:partyId, password: password, slot:slot});
    });
}