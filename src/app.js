const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");
const app = express();
      app.use(express.json());
      app.use(cors());
      app.use('/repositories/:id', validateRepositoryId);

function validateRepositoryId(request, response, next) {
  const {id} = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({
      error: 'Invalid project ID'
    })
  }

  return next();
}

function checkLikeUpdate(request, response, next) {
  const body = request.body;
  
  if ('likes' in body) {
    console.log(body);
    return response.json({likes: 0});
  }

  return next();
}

const repositories = [];

app.get("/repositories", (request, response) => {
   return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const {title, url, techs} = request.body;
  
  const repository = {id: uuid(), title, url, techs, likes: 0};

  repositories.push(repository)

  return response.json(repository);
});

app.put("/repositories/:id", checkLikeUpdate, (request, response) => {
  const {id} = request.params;
  const {title, url, techs} = request.body;
  const repositoryIndex = repositories.findIndex(repository => repository.id ===id);

  if(repositoryIndex <0){
    return response.status(400).json({
      error: 'Repository not found'
    });
  }

  const repository = {id, title, url, techs};

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const {id} = request.params;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({
      error: 'Repository not found'
    });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const {id} = request.params;
  //const {likes} = request.body;
  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0) {
    return response.status(400).json({
      error: 'Repository not found'
    });
  }

  let currentRepo = repositories[repositoryIndex];
  const repository = {
    id: currentRepo.id, 
    title: currentRepo.title, 
    url: currentRepo.url, 
    techs: currentRepo.techs, 
    likes: currentRepo.likes + 1
  };

  currentRepo = repository;
  
  repositories.splice(repositoryIndex, 1);
  repositories.push(currentRepo)
  return response.json(currentRepo);
});

module.exports = app;
