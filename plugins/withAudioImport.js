const { withInfoPlist } = require("expo/config-plugins");

const withAudioImportSupport = (config) => {
  return withInfoPlist(config, (config) => {
    const bundleId = config.ios.bundleIdentifier;

    const newUTIs = [
      {
        UTTypeIdentifier: `${bundleId}.mp3`,
        UTTypeConformsTo: ["public.audio"],
        UTTypeDescription: "MP3 Audio",
        UTTypeTagSpecification: {
          "public.filename-extension": ["mp3"],
          "public.mime-type": ["audio/mpeg"],
        },
      },
      {
        UTTypeIdentifier: `${bundleId}.wav`,
        UTTypeConformsTo: ["public.audio"],
        UTTypeDescription: "WAV Audio",
        UTTypeTagSpecification: {
          "public.filename-extension": ["wav"],
          "public.mime-type": ["audio/wav"],
        },
      },
      {
        UTTypeIdentifier: `${bundleId}.m4a`,
        UTTypeConformsTo: ["public.audio"],
        UTTypeDescription: "M4A Audio",
        UTTypeTagSpecification: {
          "public.filename-extension": ["m4a"],
          "public.mime-type": ["audio/mp4"],
        },
      },
      {
        UTTypeIdentifier: `${bundleId}.flac`,
        UTTypeConformsTo: ["public.audio"],
        UTTypeDescription: "FLAC Audio",
        UTTypeTagSpecification: {
          "public.filename-extension": ["flac"],
          "public.mime-type": ["audio/flac"],
        },
      },
      {
        UTTypeIdentifier: `${bundleId}.aac`,
        UTTypeConformsTo: ["public.audio"],
        UTTypeDescription: "AAC Audio",
        UTTypeTagSpecification: {
          "public.filename-extension": ["aac"],
          "public.mime-type": ["audio/aac"],
        },
      },
    ];

    // First, handle UTExportedTypeDeclarations
    const existingUTIs = new Set(
      (config.modResults.UTExportedTypeDeclarations || []).map(
        (declaration) => declaration.UTTypeIdentifier
      )
    );

    const filteredNewUTIs = newUTIs.filter(
      (uti) => !existingUTIs.has(uti.UTTypeIdentifier)
    );

    // Handle CFBundleDocumentTypes
    let documentTypes = [...(config.modResults.CFBundleDocumentTypes || [])];
    
    // Remove existing Audio entry if it exists
    documentTypes = documentTypes.filter(
      type => type.CFBundleTypeName !== "Audio"
    );

    // Add both Image and Audio entries
    documentTypes.push({
      CFBundleTypeName: "Audio",
      LSHandlerRank: "Owner",
      LSItemContentTypes: [
        "public.audio",
        `${bundleId}.mp3`,
        `${bundleId}.wav`,
        `${bundleId}.m4a`,
        `${bundleId}.flac`,
        `${bundleId}.aac`,
      ],
    });

    // Apply all changes
    config.modResults = {
      ...config.modResults,
      CFBundleDocumentTypes: documentTypes,
      UTExportedTypeDeclarations: [
        ...(config.modResults.UTExportedTypeDeclarations || []),
        ...filteredNewUTIs,
      ],
    };

    return config;
  });
};

module.exports = withAudioImportSupport;
