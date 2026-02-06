declare module 'deboa' {
    export interface ControlFileOptions {
        maintainer: string;
        packageName: string;
        shortDescription: string;
        version: string;
        architecture?: string;
        depends?: string;
        displayName?: string;
        userVisible?: string;
    }

    export interface DeboaOptions {
        controlFileOptions: ControlFileOptions;
        sourceDir: string;
        targetDir: string;
        targetFileName?: string;
    }

    export class Deboa {
        constructor(options: DeboaOptions);
        public package(): Promise<void>;
    }
}
