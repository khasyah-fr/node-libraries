export default ({ staticData, nettedData }) => {
    const expectedTotals = {}
    const nettedTotals = {}

    for (const tx of staticData) {
        expectedTotals[tx.customerName] = (expectedTotals[tx.customerName] || 0) + tx.transactionAmount;
    }

    for (const tx of nettedData) {
        nettedTotals[tx.customerName] = (nettedTotals[tx.customerName] || 0) + tx.transactionAmount;
    }

    return Object.keys(expectedTotals).map(customerName => ({
        customerName,
        expected: expectedTotals[customerName],
        actual: nettedTotals[customerName] || 0,
        match: expectedTotals[customerName] === nettedTotals[customerName]
    }));
}