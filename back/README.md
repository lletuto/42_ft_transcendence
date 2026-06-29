Bonjour la tcheam

Pour faire vos tests, vous pouvez faire:

```
docker compose up --build
docker compose down
```

Pour l'instant, le serveur est sur votre localhost avec le port 3000 donc http://localhost:3000

Je nai pas encore setup le docker nginx, mais ca devrait arriver. 
Vous pouvez bosser dans votre propre modules dans src/modules. 

J'ai deja setup des fichiers mais il n'y a rien dessus, hesitez pas a faire plusieurs dossier et de pas modifier les files des autres pour eviter les conflits. 

## Pour les differents stack sur lesquelles ont taff.
Front : NextJS ? (voir avec Lena)
Back: NestJs (regardez comment marche les modules sur nestjs pour les integrer au back)
Database: Postgresql Mais on se sert d'un ORM qui s'appelle Prisma. Prisma va nous permettre de communique avec la base de donnees donc pas de sql directement de notre part. Il faut donc regarder comment utiliser prisma

## Pour les bonnes pratiques sur git:

On ne bosse jamais sur le main, on a une branche dev et a partir de cette branch dev, on va pouvoir creer notre propre feature. Oubliez pas de faire des commits regulierement, et de bien commenter vos commits sur ce que vous avezfait. On evite les commits ou on a rajoute 5000 lignes de code du genre commit -m "big fix lol" (mes commits ressemblaient a ca jusqu'a maintenant).
