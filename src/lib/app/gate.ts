// The sum a grown-up answers before the settings open, so a child playing alone doesn't change them: two
// numbers from the times table, which children of kindergarten age can't multiply yet.

export type Sum = { a: number; b: number };

/** A new sum, with factors from 3 to 9, and never the one just asked. */
export function newSum(last?: Sum, random: () => number = Math.random): Sum {
	const factor = () => 3 + Math.floor(random() * 7);
	const sum = { a: factor(), b: factor() };
	// The same sum again would look as if the answer hadn't been read.
	if (last && sum.a === last.a && sum.b === last.b)
		return { a: sum.a, b: sum.b === 9 ? 3 : sum.b + 1 };
	return sum;
}

/** Whether what was typed answers the sum. */
export function solves(sum: Sum, typed: string) {
	const answer = typed.trim();
	return /^\d+$/.test(answer) && Number(answer) === sum.a * sum.b;
}
