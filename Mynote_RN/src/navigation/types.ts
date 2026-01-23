import { Score } from '../services/api';

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    SongDetail: { score: Score };
    CollectionDetail: undefined;
};

export type AuthStackParamList = {
    Launch: undefined;
    Start: undefined;
    Login: undefined;
    Register: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Studio: undefined;
    Collection: undefined;
};
