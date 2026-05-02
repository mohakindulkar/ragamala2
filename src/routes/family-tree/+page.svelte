<script>
    import AncestryTree from "$lib/components/AncestryTree.svelte";
    // import ragas from "$lib/data/ragas.json";
    import hindol from '$lib/data/hindol.json';
    import dipak from '$lib/data/dipak.json';
    import megh from '$lib/data/megh.json';
    import sri from '$lib/data/sri.json';
    import malkauns from '$lib/data/malkauns.json';
    import bhairav from '$lib/data/bhairav.json';

    // Construct the root object dynamically
    const data = {
        name: "Ragamala",
        children: [hindol, dipak, megh, sri, malkauns, bhairav]
    };

    // Now pass 'data' to d3.hierarchy(data) as usual
</script>

<AncestryTree {data} />
