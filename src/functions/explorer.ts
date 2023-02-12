// These functions are useful for putting Penny in "integrate" mode,
// i.e. preinstalled on a Pod as its native interface.


	// are we in the the solid server's root directory ?
	// if so, we much use "house" icon instead of "folder"
export function isRootContainter(resource): Boolean {
  const url = new URL(resource.data.internal_resourceInfo.sourceIri)
  const nb_slashes = url.pathname.split('/').length -1
  return nb_slashes <= 1 
}

export function getFileTypeIcon(filename: string, isHome?: Boolean): string {
  	if (filename.slice(-1) == '/'){
    	return isHome ? '🏠' : '📁'
  	}
    const fileExtension = filename.split('.').pop();
    switch (fileExtension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return '🖼️';
        case 'mp4':
        case 'mkv':
        case 'avi':
            return '🎥';
        case 'txt':
        case 'pdf':
        case 'doc':
        case 'docx':
        case 'odt':
            return '📄';
        case 'xls':
        case 'xlsx':
        case 'ods':
            return '📊';
        case 'ppt':
        case 'pptx':
        case 'odp':
            return '📈';
        case 'zip':
        case 'rar':
        case '7z':
            return '🗜️';
        default:
            return '';
    }
}

