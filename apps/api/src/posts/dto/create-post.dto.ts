export class CreatePostDto {
    contentJson: any; // Using any for now as it's a JSON object from the editor
    visibility?: string;
}
