import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.load();
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }

  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }

  async add(username) {
    try{
      const userExists=this.entries.filter(user => user.login === username)
      if(userExists.length!==0){
        throw new Error("Usuário já cadastrado")
      }

      const user = await GithubUser.search(username);

      if(user.login === undefined){
        throw new Error('Usuário não encontrado')
      }

      this.entries = [user, ...this.entries];
      this.update()
      this.save();
    } catch(error){
      alert(error.message)
    }
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login);
    this.entries = filteredEntries;
    this.update();
    this.save()
  }

}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);

    this.tbody = document.querySelector("table tbody");

    this.update();
    this.onSearch();
  }

  onSearch() {
    const addButton = document.querySelector(".search button");
    const searchInput = document.querySelector(".search input")
    addButton.onclick = () => {
      this.onAdd()
    };
    searchInput.onkeypress=(e)=> {
      if(e.key=='Enter'){
        this.onAdd()
      }
    }
  }

  onAdd(){
    const value = document.querySelector(".search input").value
    this.add(value)
  }

  update() {
    if (this.entries.length == 0) {
      this.removeAllTr();
      const initialRow = this.initialTable();
      this.tbody.append(initialRow);
    } else {
      this.removeAllTr();
      this.entries.forEach((user) => {
        const row = this.createRow();

        row.querySelector(
          ".user img"
        ).src = `https://github.com/${user.login}.png`;
        row.querySelector(".user img").alt = `Imagem de ${user.name}`;
        row.querySelector(".user a").href = `https://github.com/${user.login}`;
        row.querySelector(".user p").textContent = user.name;
        row.querySelector(".user span").textContent = user.login;
        row.querySelector(".repositories").textContent = user.public_repos;
        row.querySelector(".followers").textContent = user.followers;

        row.querySelector(".remove").onclick = () => {
          const isOK = confirm("Tem certeza que deseja deletar essa linha?");
          if (isOK) {
            this.delete(user);
          }
        };

        this.tbody.append(row);
      });
    }
  }

  createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="user">
        <img
          src="https://github.com/Raissa-Cardoso.png"
          alt="Imagem do perfil do github"
        />
        <a href="https://github.com/Raissa-Cardoso" target="_blank">
          <p>Raissa Cardoso</p>
          <span>Raissa-Cardoso</span>
        </a>
      </td>
      <td class="repositories">42</td>
      <td class="followers">14</td>
      <td>
        <button class="remove">Remover</button>
      </td>
    `;

    return tr;
  }

  initialTable() {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td id="initialRow">
        <img
          src="/assets/Estrela.svg"
          alt="Imagem de uma estrela com uma carinha"
        />
        <span>Nenhum favorito ainda</span>
      </td>
    `;

    return tr;
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
