import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import db from './_db';
import { typeDefs } from './schema';

type IdType = {
  id: string;
};
type GameType = {
  title: string;
  platform: string[];
};

const resolvers = {
  Query: {
    games: () => db.games,
    game: (_: never, args: IdType) => db.games.find((g) => g.id === args.id),
    reviews: () => db.reviews,
    review: (_: never, args: IdType) =>
      db.reviews.find((r) => r.id === args.id),
    authors: () => db.authors,
    author: (_: never, args: IdType) => db.authors.find((a) => a.id === args.id)
  },
  Game: {
    reviews: (parent: any) => db.reviews.filter((r) => r.game_id === parent.id)
  },
  Author: {
    reviews: (parent: any) =>
      db.reviews.filter((r) => r.author_id === parent.id)
  },
  Review: {
    game: (parent: any) => db.games.find((g) => g.id === parent.game_id),
    author: (parent: any) => db.authors.find((a) => a.id === parent.author_id)
  },
  Mutation: {
    deleteGame: (_: never, args: IdType) => {
      db.games = db.games.filter((g) => g.id !== args.id);
      return db.games;
    },
    addGame: (_: never, args: { game: GameType }) => {
      let game = {
        ...args.game,
        id: Math.floor(Math.random() * 10000).toString()
      };
      db.games.push(game);
      return game;
    },
    updateGame: (_: never, args: { id: IdType['id']; edits: GameType }) => {
      db.games = db.games.map((g) =>
        g.id === args.id ? { ...g, ...args.edits } : g
      );
      return db.games.find((g) => g.id === args.id);
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 }
});
